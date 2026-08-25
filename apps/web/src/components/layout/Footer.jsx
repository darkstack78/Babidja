import Link from 'next/link'
import { Globe, ChevronDown } from 'lucide-react'
import Logo from '../Logo'
import Button from '../ui/Button'

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-100 bg-white pb-40 lg:pb-0">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 sm:px-6 lg:flex-row">
        <Logo />
        <nav className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-secondary">Accueil</Link>
          <Link href="/chambres" className="hover:text-secondary">Chambres & Suites</Link>
          <Link href="/compte/reservations" className="hover:text-secondary">Mes réservations</Link>
          <span className="flex items-center gap-1.5">
            <Globe className="size-4" />
            Français
            <ChevronDown className="size-4" />
          </span>
        </nav>
        <div className="flex items-center gap-3">
          <Button href="/connexion" variant="outline" size="sm">Se connecter</Button>
          <Button href="/inscription" variant="secondary" size="sm">S’inscrire</Button>
        </div>
      </div>
      <p className="border-t border-gray-100 py-4 text-center text-xs text-gray-500">
        © 2026 Babydja — Le meilleur, à la manière ivoirienne
      </p>
    </footer>
  )
}
