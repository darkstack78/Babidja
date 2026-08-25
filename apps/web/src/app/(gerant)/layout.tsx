'use client';

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, CalendarDays, MessageSquare, BedDouble, LogOut, Loader2, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import Logo from '@/components/Logo'

const adminItems = [
  { href: '/gerant', icon: LayoutDashboard, label: 'Tableau de bord', exact: true },
  { href: '/gerant/reservations', icon: CalendarDays, label: 'Réservations' },
  { href: '/gerant/catalogue', icon: BedDouble, label: 'Catalogue' },
  { href: '/gerant/messagerie', icon: MessageSquare, label: 'Messagerie' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, logout, openDrawer } = useAuthStore()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (!isAuthenticated) {
      openDrawer('login')
      router.replace('/')
      return
    }
    // Vérification du rôle
    if (user?.role !== 'TENANT_ADMIN' && user?.role !== 'TENANT_EMPLOYEE' && user?.role !== 'SUPER_ADMIN') {
      router.replace('/')
    }
  }, [hydrated, isAuthenticated, user, router, openDrawer])

  if (!hydrated || !isAuthenticated || (user?.role !== 'TENANT_ADMIN' && user?.role !== 'TENANT_EMPLOYEE' && user?.role !== 'SUPER_ADMIN')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="size-8 animate-spin text-[#e97c2a]" />
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="flex h-16 items-center px-6 border-b border-gray-100">
          <Logo />
        </div>
        <div className="px-6 py-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Espace Gérant</p>
          <p className="text-sm font-bold text-gray-900 mt-1 line-clamp-1">{user?.firstName} {user?.lastName}</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {adminItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive ? 'bg-[#e97c2a]/10 text-[#e97c2a]' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-gray-100 p-4 space-y-2">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="size-5" />
            Retour au site public
          </Link>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="size-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header Mobile */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden">
          <Logo />
          <Link href="/" className="text-sm font-semibold text-[#e97c2a]">Quitter</Link>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-5xl">
            {children}
          </div>
        </main>
      </div>

      {/* Navigation Mobile Bottom */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-end justify-around border-t border-gray-200 bg-white px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-bottom, 1rem))] md:hidden">
        {adminItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex flex-col items-center gap-0.5 transition-all duration-300 active:scale-90 ${
                isActive ? '-mt-7' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span
                className={`grid place-items-center transition-all duration-300 ${
                  isActive
                    ? 'size-14 rounded-full border-4 border-white bg-[#e97c2a] text-white shadow-lg'
                    : 'size-7 bg-transparent text-current'
                }`}
              >
                <item.icon className={isActive ? 'size-6' : 'size-5'} />
              </span>
              <span className={`text-[10px] transition-colors duration-300 ${isActive ? 'font-bold text-[#e97c2a]' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
