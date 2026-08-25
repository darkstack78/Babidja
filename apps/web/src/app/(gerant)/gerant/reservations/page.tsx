'use client';

import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, Check, X, Eye } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import http from '@/lib/http'
import { fcfa } from '@/utils/formatters'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import type { Booking } from '@/types/booking'

export default function AdminReservations() {
  const { user } = useAuthStore()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.tenantId) return
    http.get(`/tenant/${user.tenantId}/bookings`)
      .then(res => setBookings(res.data))
      .catch(() => setError("Impossible de charger les réservations."))
      .finally(() => setLoading(false))
  }, [user?.tenantId])

  const updateStatus = async (bookingId: string, status: 'CONFIRMED' | 'CANCELLED') => {
    if (!user?.tenantId) return
    setActionLoading(bookingId)
    try {
      await http.patch(`/tenant/${user.tenantId}/bookings/${bookingId}`, { status })
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b))
    } catch {
      alert("Erreur lors de la mise à jour de la réservation.")
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#e97c2a]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 text-red-600 flex items-center gap-3">
        <AlertCircle className="size-6 shrink-0" />
        <p className="font-semibold">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Réservations</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez les demandes de réservation de vos clients.</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
            <tr>
              <th className="px-6 py-4 font-semibold">Référence</th>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Dates</th>
              <th className="px-6 py-4 font-semibold">Montant</th>
              <th className="px-6 py-4 font-semibold">Statut</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Aucune réservation trouvée.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">{booking.bookingRef}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {booking.resourceType === 'ROOM' ? 'Chambre/Suite' : 'Véhicule'}
                  </td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                    {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {fcfa(booking.totalAmount)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      booking.status === 'CONFIRMED' ? 'success' :
                      booking.status === 'PENDING' ? 'warning' :
                      booking.status === 'CANCELLED' ? 'error' : 'default'
                    }>
                      {booking.status === 'PENDING' ? 'En attente' :
                       booking.status === 'CONFIRMED' ? 'Confirmée' :
                       booking.status === 'CANCELLED' ? 'Annulée' : booking.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {booking.status === 'PENDING' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="primary" 
                            onClick={() => updateStatus(booking.id, 'CONFIRMED')}
                            disabled={actionLoading === booking.id}
                          >
                            {actionLoading === booking.id ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="danger" 
                            onClick={() => updateStatus(booking.id, 'CANCELLED')}
                            disabled={actionLoading === booking.id}
                          >
                            <X className="size-4" />
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
