'use client';

import { useState } from 'react'
import { BedDouble, Car, CalendarDays, Loader2 } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { fcfa } from '@/utils/formatters'
import { useQuery } from '@tanstack/react-query'
import { fetchMyBookings } from '@/lib/api/bookings'
import type { Booking } from '@/types/booking'

const statusFilters = ['Toutes', 'À venir', 'En cours', 'Terminées', 'Annulées']
const typeFilters = ['Tous', 'Hôtels', 'Voitures']

const statusVariant: Record<string, "success" | "warning" | "neutral" | "danger" | "primary"> = { 
  'PENDING': 'warning', 
  'CONFIRMED': 'success', 
  'COMPLETED': 'neutral', 
  'CANCELLED': 'danger' 
}

const statusLabel: Record<string, string> = { 
  'PENDING': 'En cours', 
  'CONFIRMED': 'À venir', 
  'COMPLETED': 'Terminées', 
  'CANCELLED': 'Annulées' 
}

const filterChipStyle: Record<string, string> = {
  'Toutes': 'bg-secondary text-white',
  'À venir': 'bg-secondary text-white',
  'En cours': 'bg-orange-100 text-primary-dark',
  'Terminées': 'bg-gray-200 text-gray-600',
  'Annulées': 'bg-red-100 text-danger',
}

function formatDate(dateString: string) {
  const d = new Date(dateString)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function Reservations() {
  const [status, setStatus] = useState('Toutes')
  const [type, setType] = useState('Tous')

  const { data: reservations = [], isLoading, isError } = useQuery<Booking[]>({
    queryKey: ['my-bookings'],
    queryFn: fetchMyBookings,
  })

  const shown = reservations.filter((r) => {
    const rStatus = statusLabel[r.status] || r.status
    const okStatus =
      status === 'Toutes' ||
      (status === 'À venir' && rStatus === 'À venir') ||
      (status === 'Terminées' && rStatus === 'Terminées') ||
      (status === 'Annulées' && rStatus === 'Annulées') ||
      (status === 'En cours' && rStatus === 'En cours')
    const okType = type === 'Tous' || (type === 'Hôtels' && r.resourceType === 'ROOM') || (type === 'Voitures' && r.resourceType === 'VEHICLE')
    return okStatus && okType
  })

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
      <h1 className="text-2xl font-extrabold">Historique des réservations</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <button
            key={f}
            onClick={() => setStatus(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              status === f ? 'bg-secondary text-white' : filterChipStyle[f] ?? 'bg-gray-100'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        {typeFilters.map((f) => (
          <button
            key={f}
            onClick={() => setType(f)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              type === f ? 'border-secondary bg-pastel text-secondary' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {isLoading && (
          <div className="col-span-full py-12 flex justify-center">
            <Loader2 className="size-8 animate-spin text-secondary" />
          </div>
        )}
        
        {isError && (
          <p className="col-span-full py-8 text-center text-sm text-red-500">Erreur lors du chargement des réservations.</p>
        )}

        {!isLoading && !isError && shown.map((r) => (
          <article key={r.id} className="rounded-2xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-pastel text-secondary">
                  {r.resourceType === 'ROOM' ? <BedDouble className="size-5" /> : <Car className="size-5" />}
                </span>
                <div>
                  <h2 className="text-sm font-bold">Réservation {r.resourceType === 'ROOM' ? 'Hôtel' : 'Voiture'}</h2>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                    <CalendarDays className="size-3.5" /> {formatDate(r.startDate)} – {formatDate(r.endDate)}
                  </p>
                </div>
              </div>
              <Badge variant={statusVariant[r.status] ?? 'neutral'}>{statusLabel[r.status] || r.status}</Badge>
            </div>
            <p className="mt-3 font-bold text-primary">{fcfa(Number(r.totalAmount))}</p>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm">
                Voir le détail
              </Button>
              {r.status === 'COMPLETED' && <Button size="sm">Laisser un avis</Button>}
            </div>
          </article>
        ))}
        {!isLoading && !isError && shown.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-gray-500">Aucune réservation dans cette catégorie.</p>
        )}
      </div>
    </div>
  )
}
