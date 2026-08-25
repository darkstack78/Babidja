import http from '../http';
import type { User } from '@/types/user';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const sendOtp = async (phone: string): Promise<{ success: true }> => {
  const { data } = await http.post('/auth/send-otp', { phone });
  return data;
};

export const verifyOtp = async (phone: string, code: string): Promise<AuthResponse> => {
  const { data } = await http.post('/auth/verify-otp', { phone, code });
  return data;
};

export const registerEmail = async (payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<AuthResponse> => {
  const { data } = await http.post('/auth/register-email', payload);
  return data;
};

export const loginEmail = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await http.post('/auth/login-email', { email, password });
  return data;
};

export const refreshToken = async (token: string): Promise<{ accessToken: string; refreshToken: string }> => {
  const { data } = await http.post('/auth/refresh', { refreshToken: token });
  return data;
};

export const exchangeOAuthCode = async (code: string): Promise<AuthResponse> => {
  const { data } = await http.post('/auth/google/exchange', { code });
  return data;
};

export const logout = async (): Promise<void> => {
  try {
    await http.post('/auth/logout');
  } catch {
    // On ignore l'erreur s'il est déjà déconnecté
  }
};

export const me = async (): Promise<User> => {
  const { data } = await http.get('/users/me');
  return data;
};

export const updateMe = async (payload: { firstName?: string; lastName?: string; email?: string; address?: string }): Promise<User> => {
  const { data } = await http.patch('/users/me', payload);
  return data;
};

export const uploadAvatar = async (file: File): Promise<User> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await http.post('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
