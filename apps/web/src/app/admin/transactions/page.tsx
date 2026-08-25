'use client';

import { ChevronDown } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import PaymentLogo from '@/components/PaymentLogo'
import { adminTransactions } from '@/data/mock'
import { fcfa } from '@/utils/formatters'

const statusVariant: Record<string, 'success' | 'warning' | 'danger'> = { Payé: 'success', 'En attente': 'warning', Échoué: 'danger' }

export default function AdminTransactions() {
  return (
    <div>
      <h1 className="text-xl font-bold">Suivi des transactions système</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <span className="font-semibold">Période :</span>
        <button className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2">
          Jour / Semaine / Mois <ChevronDown className="size-4" />
        </button>
      </div>

      <div className="mt-4 rounded-2xl bg-secondary p-5 text-center text-white">
        <p className="text-sm font-medium">Total transactions encaissées (Période)</p>
        <p className="mt-1 text-3xl font-extrabold">{fcfa(1250000)}</p>
      </div>

      <section className="mt-4 overflow-x-auto rounded-2xl bg-white p-5 shadow-sm">
        <table className="w-full min-w-2xl text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
              <th className="py-2 font-semibold">Client</th>
              <th className="py-2 font-semibold">Service réservé</th>
              <th className="py-2 font-semibold">Montant</th>
              <th className="py-2 font-semibold">Date d'ajout</th>
              <th className="py-2 font-semibold">Méthode</th>
              <th className="py-2 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody>
            {adminTransactions.map((t) => (
              <tr key={t.id} className="border-b border-gray-50">
                <td className="py-3 font-medium">{t.client}</td>
                <td className="py-3 text-gray-500">{t.service}</td>
                <td className="py-3 font-semibold">{fcfa(t.amount)}</td>
                <td className="py-3 text-gray-500">{t.date}</td>
                <td className="py-3">
                  <span className="flex items-center gap-1.5">
                    <PaymentLogo method="Visa" className="h-6 w-9" />
                  </span>
                </td>
                <td className="py-3">
                  <Badge variant={statusVariant[t.status === 'Confirmée' ? 'Payé' : t.status] ?? 'warning'}>
                    {t.status === 'Confirmée' ? 'Payé' : t.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
