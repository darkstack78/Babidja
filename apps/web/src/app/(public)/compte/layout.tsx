'use client';

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CircleUser, House, User, CalendarDays, CreditCard, Wallet, Bell, MessageSquare } from 'lucide-react'

const items = [
  { href: '/compte/informations', icon: CircleUser, label: 'Mon compte', mobileOnly: true },
  { href: '/compte', icon: House, label: 'Mon tableau de bord', exact: true },
  { href: '/compte/informations', icon: User, label: 'Mes informations' },
  { href: '/compte/reservations', icon: CalendarDays, label: 'Mes réservations' },
  { href: '/compte/paiement', icon: CreditCard, label: 'Moyens de paiement' },
  { href: '/compte/solde', icon: Wallet, label: 'Mon solde' },
  { href: '/compte/messagerie', icon: MessageSquare, label: 'Messagerie' },
  { href: '/compte/notifications', icon: Bell, label: 'Notifications' },
]

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

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
      <main className="min-w-0 flex-1 pb-20 lg:pb-0">
        {children}
      </main>
    </div>
  )
}
