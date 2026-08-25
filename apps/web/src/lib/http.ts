import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// UX-07 : Refresh token silencieux.
// Quand le serveur retourne 401, on tente un renouvellement via /auth/refresh.
// Si la rotation de token réussit, la requête d'origine est relansée automatiquement.
// Si ça échoue (token expiré ou révoqué), on force la déconnexion explicite.
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  failedQueue = [];
}

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Eviter une boucle infinie sur /auth/refresh lui-même
    if (error.response?.status === 401 && !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/refresh')) {
      if (isRefreshing) {
        // Une rotation est déjà en cours : mettre la requête en file d'attente
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return http(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken, setSession, logout } = useAuthStore.getState();

      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${http.defaults.baseURL}/auth/refresh`,
          { refreshToken },
        );
        // Mettre à jour le store avec les nouveaux tokens
        setSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: useAuthStore.getState().user! });
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return http(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default http;

import type { AxiosRequestConfig } from 'axios';

export const customInstance = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
  return http({ ...config, ...options }).then(({ data }) => data);
};
