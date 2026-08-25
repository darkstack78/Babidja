"use client"

import { useEffect, useState } from 'react'
import http from '@/lib/http'
import { Building2, Calendar } from 'lucide-react'

interface Booking {
  id: string
  status: string
  startDate: string
  endDate: string
  tenant: {
    id: string
    name: string
  }
}

interface Props {
  onSelectBooking: (bookingId: string, name: string) => void
  selectedBookingId?: string
}

export default function ClientConversationsSidebar({ onSelectBooking, selectedBookingId }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBookings() {
      try {
        const { data } = await http.get('/bookings/my-bookings')
        if (Array.isArray(data)) {
          setBookings(data)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des réservations', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  if (loading) {
    return <div className="p-4 text-gray-500">Chargement...</div>
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col h-[600px] items-center justify-center gap-3 rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm w-full max-w-sm">
        <span className="grid size-16 place-items-center rounded-2xl bg-gray-50">
          <Building2 className="size-8 text-gray-300" />
        </span>
        <p className="font-semibold text-gray-700">Aucune conversation</p>
        <p className="text-sm text-gray-400 max-w-[200px]">
          Faites une réservation pour démarrer une conversation avec l&apos;établissement.
        </p>
        <a
          href="/chambres"
          className="mt-2 rounded-full bg-secondary px-5 py-2 text-sm font-bold text-white hover:bg-secondary/90 transition-colors"
        >
          Voir les chambres
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden w-full max-w-sm">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h2 className="font-bold text-gray-900">Conversations</h2>
        <p className="text-xs text-gray-500">Sélectionnez une réservation</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {bookings.map((booking) => {
          const tenantName = booking.tenant?.name || 'Établissement'
          const isSelected = booking.id === selectedBookingId

          return (
            <button
              key={booking.id}
              onClick={() => onSelectBooking(booking.id, tenantName)}
              className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 items-center ${isSelected ? 'bg-pastel/30 border-l-4 border-l-primary' : ''}`}
            >
              <div className="grid size-10 place-items-center rounded-full bg-pastel text-primary shrink-0">
                <Building2 className="size-5" />
              </div>
              <div className="overflow-hidden">
                <h3 className="font-semibold text-gray-900 truncate">{tenantName}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 truncate">
                  <Calendar className="size-3" />
                  {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                </p>
                <p className="text-xs text-secondary mt-1">
                  Status: {booking.status}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
