'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Logo from '@/components/Logo'

export function GoogleIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.7-.2-2.5H12v4.8h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-9z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1 .7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.7-4.9H1.3v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.3 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.3a12 12 0 0 0 0 10.8l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8L20 3.2A12 12 0 0 0 1.3 6.7l4 3.1c1-2.9 3.6-5 6.7-5z" />
    </svg>
  )
}

/** Onglets Téléphone / E-mail / Google des écrans de connexion. */
export function AuthTabs({ tabs, active, onChange }: { tabs: any[], active: string, onChange: (id: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-1.5 border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
            active === tab.id ? 'border-secondary text-ink' : 'border-transparent text-gray-500 hover:text-ink'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  )
}

/** Carte d'authentification centrée avec logo. */
export function AuthCard({ children, wide = false, showBack = false }: { children: React.ReactNode, wide?: boolean, showBack?: boolean }) {
  const router = useRouter()
  return (
    <div className="grid min-h-screen place-items-center px-4 py-8">
      <div className={`w-full rounded-3xl bg-white p-8 shadow-lg ${wide ? 'max-w-md' : 'max-w-sm'}`}>
        <div className="relative flex justify-center">
          {showBack && (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Retour"
              className="group absolute left-0 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all hover:bg-gray-200 active:scale-90"
            >
              <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            </button>
          )}
          <Logo />
        </div>
        {children}
      </div>
    </div>
  )
}

/** Champ téléphone avec indicatif ivoirien +225. */
export function PhoneField({
  value,
  onChange,
  disabled = false,
}: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center rounded-xl border border-gray-300 bg-white">
      <span className="flex items-center gap-1.5 border-r border-gray-200 px-3 py-3 text-sm font-medium">
        <span className="flex h-3.5 w-5 overflow-hidden rounded-sm" aria-hidden="true">
          <span className="w-1/3 bg-primary" />
          <span className="w-1/3 bg-white" />
          <span className="w-1/3 bg-secondary" />
        </span>
        +225
      </span>
      <input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Numéro de téléphone"
        className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-gray-400 disabled:text-gray-400"
      />
    </div>
  )
}

export function useAuthTab(initial = 'email') {
  return useState(initial)
}
