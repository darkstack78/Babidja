'use client';

import { useState } from 'react';
import { Wallet } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useAuthStore } from '@/store/useAuthStore'
import { fcfa } from '@/utils/formatters'

export default function Solde() {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { user } = useAuthStore()
  const balance = user?.walletBalance ?? 0

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
      <h1 className="text-2xl font-extrabold mb-6">Mon solde</h1>
      
      <section className="flex max-w-sm mx-auto flex-col items-center rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
        <span className="grid size-16 place-items-center rounded-2xl bg-pastel">
          <Wallet className="size-8 text-secondary" />
        </span>
        <p className="mt-4 text-gray-500 font-semibold uppercase text-sm">Solde actuel</p>
        <p className="mt-1 text-4xl font-extrabold text-primary">{fcfa(balance)}</p>
        <Button className="mt-6 w-full py-3">Recharger mon compte</Button>
        <Button variant="secondary" className="mt-3 w-full py-3">
          Voir l’historique des transactions
        </Button>
      </section>
    </div>
  )
}
