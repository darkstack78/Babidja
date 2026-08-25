'use client';
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Globe, ChevronDown, House, CalendarDays, BedDouble, User, Car } from 'lucide-react'
import Logo from '../Logo'
import Button from '../ui/Button'
import { useAuthStore } from '../../store/useAuthStore'

const links = [
  { href: '/', label: 'Accueil' },
  { href: '/chambres', label: 'Chambres & Suites' },
  { href: '/voitures', label: 'Location de voitures' },
  { href: '/compte/reservations', label: 'Mes réservations' },
]

export default function NavbarPublic() {
  const { openDrawer, isAuthenticated } = useAuthStore()
  const pathname = usePathname()

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-7 lg:flex">
            {links.map((l) => {
              const isActive = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`border-b-2 pb-1 text-sm font-medium transition-colors ${
                    isActive ? 'border-secondary text-secondary' : 'border-transparent hover:text-secondary'
                  }`}
                >
                  {l.label}
                </Link>
              )
            })}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="hidden items-center gap-1.5 text-sm font-medium md:flex">
              <Globe className="size-4" />
              Français
              <ChevronDown className="size-4" />
            </button>
            {!isAuthenticated ? (
              <Button onClick={() => openDrawer('login')} variant="outline" className="hidden sm:inline-flex px-3 py-1.5 text-xs sm:px-4 sm:py-1.5 sm:text-sm">
                Se connecter
              </Button>
            ) : (
              <Button href="/compte" variant="outline" className="hidden sm:inline-flex px-3 py-1.5 text-xs sm:px-4 sm:py-1.5 sm:text-sm">
                Mon compte
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation mobile (indicateur dynamique) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-end justify-around border-t border-gray-200 bg-white px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
        <MobileItem href="/" icon={House} label="Accueil" pathname={pathname} />
        <MobileItem href="/chambres" icon={BedDouble} label="Hôtel" pathname={pathname} />
        <MobileItem href="/voitures" icon={Car} label="Voitures" pathname={pathname} />
        <MobileItem href="/compte/reservations" icon={CalendarDays} label="Réservations" pathname={pathname} />
        <MobileItem href="/compte" icon={User} label="Profil" pathname={pathname} />
      </nav>
    </>
  )
}

function MobileItem({ href, icon: Icon, label, pathname }) {
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`group flex flex-col items-center gap-0.5 transition-all duration-300 active:scale-90 ${
        isActive ? '-mt-7' : 'text-gray-500 hover:text-gray-900'
      }`}
    >
      <span
        className={`grid place-items-center transition-all duration-300 ${
          isActive
            ? 'size-14 rounded-full border-4 border-white bg-secondary text-white shadow-lg group-hover:-translate-y-1.5 group-hover:shadow-secondary/50 group-active:bg-secondary-dark'
            : 'size-7 bg-transparent text-current'
        }`}
      >
        <Icon
          className={`transition-transform duration-300 group-hover:scale-110 group-active:scale-90 ${
            isActive ? 'size-6' : 'size-5'
          }`}
        />
      </span>
      <span
        className={`text-[10px] transition-colors duration-300 ${
          isActive
            ? 'font-bold text-secondary group-hover:text-secondary-dark'
            : 'font-medium'
        }`}
      >
        {label}
      </span>
    </Link>
  )
}
