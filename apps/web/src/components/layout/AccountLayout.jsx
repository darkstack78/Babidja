import Link from 'next/link'
import { CircleUser, House, User, CalendarDays, CreditCard, Wallet, Bell } from 'lucide-react'
import NavbarPublic from './NavbarPublic'

const items = [
  { to: '/compte/informations', icon: CircleUser, label: 'Mon compte' },
  { to: '/compte', icon: House, label: 'Mon tableau de bord', end: true },
  { to: '/compte/informations', icon: User, label: 'Mes informations', dup: true },
  { to: '/compte/reservations', icon: CalendarDays, label: 'Mes réservations' },
  { to: '/compte/paiements', icon: CreditCard, label: 'Moyens de paiement' },
  { to: '/compte/solde', icon: Wallet, label: 'Mon solde' },
  { to: '/compte/notifications', icon: Bell, label: 'Notifications' },
]

export default function AccountLayout() {
  return (
    <div className="min-h-screen">
      <NavbarPublic />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden w-60 shrink-0 md:block">
          <nav className="flex flex-col gap-1 rounded-2xl bg-white p-3 shadow-sm">
            {items.map((item, i) => (
              <Link
                key={i}
                href={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive && !item.dup ? 'bg-pastel text-secondary' : 'hover:bg-gray-50'
                  }`
                }
              >
                <item.icon className="size-4.5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
