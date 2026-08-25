'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CircleUser, House, User, CalendarDays, CreditCard, Bell, MessageSquare } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'

const items = [
  { href: '/compte/informations', icon: CircleUser, label: 'Mon compte', mobileOnly: true },
  { href: '/compte', icon: House, label: 'Mon tableau de bord', exact: true },
  { href: '/compte/informations', icon: User, label: 'Mes informations' },
  { href: '/compte/reservations', icon: CalendarDays, label: 'Mes réservations' },
  { href: '/compte/paiement', icon: CreditCard, label: 'Moyens de paiement' },
  { href: '/compte/messagerie', icon: MessageSquare, label: 'Messagerie' },
  { href: '/compte/notifications', icon: Bell, label: 'Notifications' },
]

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, openDrawer } = useAuthStore()
  // Évite le flash SSR → on attend l'hydratation avant de vérifier l'auth
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setHydrated(true), 0)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (!isAuthenticated) {
      // Ouvre le drawer de connexion puis redirige vers l'accueil
      openDrawer('login')
      router.replace('/')
    }
  }, [hydrated, isAuthenticated, openDrawer, router])

  // Pendant l'hydratation ou si non authentifié : affiche un loader Skeleton
  if (!hydrated || !isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 min-h-[60vh] animate-pulse">
        {/* Skeleton Sidebar */}
        <aside className="hidden w-60 shrink-0 md:block">
          <div className="flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-sm border border-gray-100">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 rounded-xl bg-gray-100"></div>
            ))}
          </div>
        </aside>
        {/* Skeleton Main Content */}
        <main className="min-w-0 flex-1">
           <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 h-full min-h-100">
              <div className="h-8 w-1/3 bg-gray-200 rounded-lg mb-6"></div>
              <div className="space-y-4">
                 <div className="h-4 w-full bg-gray-100 rounded"></div>
                 <div className="h-4 w-5/6 bg-gray-100 rounded"></div>
                 <div className="h-4 w-4/6 bg-gray-100 rounded"></div>
                 <div className="h-32 w-full bg-gray-50 rounded-xl mt-6"></div>
              </div>
           </div>
        </main>
      </div>
    )
  }

  const mobileItems = [
    { href: '/compte', icon: House, label: 'Accueil', exact: true },
    { href: '/compte/reservations', icon: CalendarDays, label: 'Réservations' },
    { href: '/compte/paiement', icon: CreditCard, label: 'Paiement' },
    { href: '/compte/messagerie', icon: MessageSquare, label: 'Messages' },
    { href: '/compte/informations', icon: User, label: 'Profil' },
  ]

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
      <aside className="hidden w-60 shrink-0 md:block">
        <nav className="flex flex-col gap-1 rounded-2xl bg-white p-3 shadow-sm">
          {items.map((item, i) => {
            if (item.mobileOnly) return null;
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={i}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-pastel text-secondary' : 'hover:bg-gray-50'
                }`}
              >
                <item.icon className="size-4.5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 pb-24 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-gray-100 bg-white px-2 pb-safe pt-2 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] md:hidden">
        {mobileItems.map((item, i) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={i}
              href={item.href}
              className={`flex flex-col items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-medium transition-colors ${
                isActive ? 'text-secondary' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <item.icon className={`size-5 ${isActive ? 'fill-secondary/10' : ''}`} />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
