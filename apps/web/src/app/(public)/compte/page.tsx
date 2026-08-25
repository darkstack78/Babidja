'use client';

import { TreePalm, User, Mail, Phone, Wallet, LogOut, CreditCard, MessageSquare, Bell } from 'lucide-react'
import Link from 'next/link'
import Avatar from '@/components/Avatar'
import Button from '@/components/ui/Button'
import { useAuthStore } from '@/store/useAuthStore'
import { fcfa } from '@/utils/formatters'
import { useRouter } from 'next/navigation'

import { useState, useEffect } from 'react'

export default function Dashboard() {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Attend l'hydratation du store persistant (zustand) avant de rendre, pour
    // éviter un flash de contenu non authentifié.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  // Nom d'affichage : prénom + nom, ou email, ou téléphone en fallback
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || user?.phone || 'Utilisateur'
  const balance = user?.walletBalance ?? 0

  if (!mounted) return null // ou un skeleton loader


  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-6">Mon tableau de bord</h1>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Carte profil */}
        <section className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <TreePalm className="absolute -left-4 bottom-0 size-24 text-secondary/15" aria-hidden="true" />
          <TreePalm className="absolute -right-2 top-2 size-16 text-primary/15" aria-hidden="true" />
          <div className="relative flex flex-col items-start gap-5 sm:flex-row">
            <div className="relative">
              <Avatar name={displayName} size="xl" />
            </div>
            <div className="flex-1">
              <ul className="flex flex-col gap-2 text-sm mt-2">
                <li className="flex items-center gap-2.5 font-bold text-base">
                  <User className="size-4 text-secondary" /> {displayName}
                </li>
                {user?.email && (
                  <li className="flex items-center gap-2.5 text-gray-600">
                    <Mail className="size-4 text-secondary" /> {user.email}
                  </li>
                )}
                {user?.phone && (
                  <li className="flex items-center gap-2.5 text-gray-600">
                    <Phone className="size-4 text-secondary" /> {user.phone}
                  </li>
                )}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button href="/compte/informations" variant="outline">Modifier mes infos</Button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  aria-label="Se déconnecter"
                >
                  <LogOut className="size-4" /> Déconnexion
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Carte solde */}
        <div className="flex flex-col gap-5">
          <section className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm border border-gray-100">
            <span className="grid size-14 place-items-center rounded-2xl bg-pastel">
              <Wallet className="size-7 text-secondary" />
            </span>
            <p className="mt-3 text-sm text-gray-500 uppercase font-bold">Mon solde</p>
            <p className="mt-1 text-3xl font-extrabold text-primary">{fcfa(balance)}</p>
            <Button href="/compte/solde" className="mt-5 w-full">Recharger</Button>
          </section>

          {/* Navigation rapide (très utile sur mobile où la sidebar est cachée) */}
          <section className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 md:hidden">
            <p className="text-sm font-bold text-gray-700 mb-3 px-2">Raccourcis</p>
            <div className="flex flex-col gap-1">
              <Link href="/compte/paiement" className="flex items-center gap-3 rounded-xl p-3 hover:bg-gray-50 transition-colors">
                <span className="grid size-8 place-items-center rounded-lg bg-gray-100 text-gray-600"><CreditCard className="size-4" /></span>
                <span className="text-sm font-medium">Moyens de paiement</span>
              </Link>
              <Link href="/compte/messagerie" className="flex items-center gap-3 rounded-xl p-3 hover:bg-gray-50 transition-colors">
                <span className="grid size-8 place-items-center rounded-lg bg-gray-100 text-gray-600"><MessageSquare className="size-4" /></span>
                <span className="text-sm font-medium">Messagerie</span>
              </Link>
              <Link href="/compte/notifications" className="flex items-center gap-3 rounded-xl p-3 hover:bg-gray-50 transition-colors">
                <span className="grid size-8 place-items-center rounded-lg bg-gray-100 text-gray-600"><Bell className="size-4" /></span>
                <span className="text-sm font-medium">Notifications</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
