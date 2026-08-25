import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/user'

interface AuthSession {
  accessToken: string
  refreshToken: string
  user: User
}

interface AuthState {
  isAuthenticated: boolean
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  isDrawerOpen: boolean
  drawerView: 'login' | 'register'
  onAuthSuccess: (() => void) | null
  openDrawer: (view?: 'login' | 'register', onSuccess?: (() => void) | null) => void
  closeDrawer: () => void
  /** Utilisé par le flux réel (email/OTP/Google) une fois les tokens obtenus du backend. */
  setSession: (session: AuthSession) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      user: null,
      isDrawerOpen: false,
      drawerView: 'register',
      onAuthSuccess: null,

      openDrawer: (view = 'register', onSuccess = null) =>
        set({ isDrawerOpen: true, drawerView: view, onAuthSuccess: onSuccess }),

      closeDrawer: () =>
        set({ isDrawerOpen: false, onAuthSuccess: null }),

      setSession: ({ accessToken, refreshToken, user }) => {
        set({ accessToken, refreshToken, user, isAuthenticated: true })
        const { onAuthSuccess } = get()
        if (onAuthSuccess) {
          onAuthSuccess()
          set({ onAuthSuccess: null })
        }
      },

      logout: () => {
        import('@/lib/api/auth').then((api) => api.logout());
        set({ isAuthenticated: false, accessToken: null, refreshToken: null, user: null });
      },
    }),
    {
      name: 'auth-storage',
      // SEC-04 (révisé) : l'accessToken (courte durée, 15 min) reste uniquement en
      // mémoire, jamais persisté. Le refreshToken (30 jours) est persisté pour que
      // la session survive à un rechargement de page (F5) : sans lui, isAuthenticated
      // resterait vrai après F5 mais tous les appels API échoueraient en 401 sans
      // aucun moyen de les rejouer, forçant une déconnexion qui ressemble à un bug.
      // Le choix accepté est un risque XSS limité au refresh token (comme la plupart
      // des SPA sans backend-for-frontend) ; à terme, le déplacer vers un cookie
      // HttpOnly géré par le backend reste la protection la plus robuste.
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
