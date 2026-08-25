'use client';

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import Avatar from '@/components/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { hotelReservations, carReservations } from '@/data/mock'
import { fcfa } from '@/utils/formatters'

const filters = ['Toutes', 'En attente', 'Confirmées', 'Annulées']
const filterToStatus: Record<string, string> = { 'En attente': 'En attente', Confirmées: 'Confirmée', Annulées: 'Annulée' }
const statusVariant: Record<string, 'warning' | 'success' | 'neutral' | 'danger'> = { 'En attente': 'warning', Confirmée: 'success', Terminée: 'neutral', Annulée: 'danger' }

export default function ProReservations({ type = 'hotel' }: { type?: 'hotel' | 'car' }) {
  const isCar = type === 'car'
  const initialData = isCar ? carReservations : hotelReservations

  const [reservations, setReservations] = useState(initialData)
  const [filter, setFilter] = useState('Toutes')
  const [query, setQuery] = useState('')

  useEffect(() => {
    setReservations(initialData)
  }, [type, initialData])

  const shown = reservations.filter(
    (r: any) =>
      (filter === 'Toutes' || r.status === filterToStatus[filter]) &&
      r.client.toLowerCase().includes(query.toLowerCase()),
  )

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setReservations(reservations.map((r: any) => 
      r.id === id ? { ...r, status: newStatus } : r
    ))
  }

  return (
    <div>
      <h1 className="text-xl font-bold">Réservations — Liste</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-64 flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom de client"
            className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-secondary"
          />
        </div>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              filter === f ? 'bg-orange-100 text-primary-dark' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <section className="mt-4 overflow-x-auto rounded-2xl bg-white p-5 shadow-sm">
        <table className="w-full min-w-2xl text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
              <th className="py-2 font-semibold">Client</th>
              <th className="py-2 font-semibold">Dates</th>
              <th className="py-2 font-semibold">Service réservé</th>
              <th className="py-2 font-semibold">Montant</th>
              <th className="py-2 font-semibold">Statut</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {shown.map((r: any) => (
              <tr key={r.id} className="border-b border-gray-50">
                <td className="py-3">
                  <span className="flex items-center gap-2.5">
                    <Avatar name={r.client} size="sm" />
                    <span>
                      <span className="block font-medium">{r.client}</span>
                      <span className="text-xs text-gray-500">{r.email}</span>
                    </span>
                  </span>
                </td>
                <td className="py-3">{r.date}</td>
                <td className="py-3">{r.service}</td>
                <td className="py-3 font-semibold">{fcfa(r.amount)}</td>
                <td className="py-3">
                  <Badge variant={statusVariant[r.status] ?? 'neutral'}>{r.status}</Badge>
                </td>
                <td className="py-3">
                  {r.status === 'En attente' && (
                    <span className="flex gap-2">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleUpdateStatus(r.id, 'Confirmée')}
                      >
                        Valider
                      </Button>
                      <button 
                        className="rounded-full bg-danger px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                        onClick={() => handleUpdateStatus(r.id, 'Annulée')}
                      >
                        Refuser
                      </button>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-500">Aucune réservation ne correspond.</p>
        )}
      </section>
    </div>
  )
}
