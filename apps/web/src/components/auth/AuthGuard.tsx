'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import type { UserRole } from '@/types/user'

interface AuthGuardProps {
  children: React.ReactNode
  redirectUrl?: string
  /** Si fourni, l'utilisateur connecté doit avoir un de ces rôles, sinon il est traité comme non autorisé. */
  allowedRoles?: UserRole[]
}

export default function AuthGuard({ children, redirectUrl = '/', allowedRoles }: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, user, openDrawer } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  const authorized = isAuthenticated && (!allowedRoles || (!!user && allowedRoles.includes(user.role)))

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !authorized) {
      router.replace(redirectUrl)

      // Si on redirige vers l'accueil, c'est probablement un client, on ouvre le tiroir.
      if (redirectUrl === '/') {
        openDrawer('login')
      }
    }
  }, [mounted, authorized, router, redirectUrl, openDrawer])

  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
  }

  if (!authorized) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
  }

  return <>{children}</>
}
