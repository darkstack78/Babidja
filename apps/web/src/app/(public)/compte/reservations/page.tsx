'use client';

import { useState } from 'react'
import { BedDouble, Car, CalendarDays, Loader2, X, Star, Send } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { fcfa } from '@/utils/formatters'
import { useQuery } from '@tanstack/react-query'
import { fetchMyBookings } from '@/lib/api/bookings'
import type { Booking } from '@/types/booking'
import http from '@/lib/http'
import { extractErrorMessage } from '@/lib/api/errors'

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

// ─── Modal Détail ─────────────────────────────────────────────────────────────
function BookingDetailModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const nights = Math.max(1, Math.round(
    (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / 86_400_000
  ))
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Détail de la réservation</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-gray-100 transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Référence</span>
            <span className="font-bold">{booking.bookingRef}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Type</span>
            <span className="font-semibold">{booking.resourceType === 'ROOM' ? 'Chambre / Suite' : 'Location de voiture'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Arrivée</span>
            <span className="font-semibold">{formatDate(booking.startDate)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Départ</span>
            <span className="font-semibold">{formatDate(booking.endDate)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Durée</span>
            <span className="font-semibold">
              {nights} {booking.resourceType === 'ROOM' ? `nuit${nights > 1 ? 's' : ''}` : `jour${nights > 1 ? 's' : ''}`}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Acompte versé</span>
            <span className="font-semibold">{fcfa(Number(booking.depositAmount))}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Reste à payer</span>
            <span className="font-semibold">{fcfa(Number(booking.remainingAmount))}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500 font-bold">Total</span>
            <span className="font-extrabold text-[#e97c2a]">{fcfa(Number(booking.totalAmount))}</span>
          </div>

          <div className="mt-2">
            <Badge variant={statusVariant[booking.status] ?? 'neutral'}>
              {statusLabel[booking.status] || booking.status}
            </Badge>
          </div>
        </div>

        <Button variant="outline" size="lg" className="mt-5 w-full" onClick={onClose}>
          Fermer
        </Button>
      </div>
    </div>
  )
}

// ─── Modal Avis ───────────────────────────────────────────────────────────────
function ReviewModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await http.post('/reviews', { bookingId: booking.id, rating, comment })
      setDone(true)
    } catch (err) {
      setError(extractErrorMessage(err, "Impossible d'envoyer l'avis. Réessayez."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Laisser un avis</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-gray-100 transition-colors">
            <X className="size-5" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-green-100">
              <Star className="size-8 fill-yellow-400 text-yellow-400" />
            </span>
            <p className="font-bold text-gray-900">Merci pour votre avis !</p>
            <p className="text-sm text-gray-500">Votre avis a été envoyé avec succès.</p>
            <Button className="mt-4" onClick={onClose}>Fermer</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-700">Note</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star className={`size-8 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Commentaire</label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Partagez votre expérience..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#e97c2a] focus:bg-white focus:ring-2 focus:ring-orange-100 resize-none"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {loading ? 'Envoi…' : 'Envoyer mon avis'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function Reservations() {
  const [status, setStatus] = useState('Toutes')
  const [type, setType] = useState('Tous')
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null)
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null)

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
    <>
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
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">{r.bookingRef}</p>
                  </div>
                </div>
                <Badge variant={statusVariant[r.status] ?? 'neutral'}>{statusLabel[r.status] || r.status}</Badge>
              </div>
              <p className="mt-3 font-bold text-primary">{fcfa(Number(r.totalAmount))}</p>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setDetailBooking(r)}>
                  Voir le détail
                </Button>
                {r.status === 'COMPLETED' && (
                  <Button size="sm" onClick={() => setReviewBooking(r)}>
                    Laisser un avis
                  </Button>
                )}
              </div>
            </article>
          ))}
          {!isLoading && !isError && shown.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-gray-500">Aucune réservation dans cette catégorie.</p>
          )}
        </div>
      </div>

      {detailBooking && (
        <BookingDetailModal booking={detailBooking} onClose={() => setDetailBooking(null)} />
      )}
      {reviewBooking && (
        <ReviewModal booking={reviewBooking} onClose={() => setReviewBooking(null)} />
      )}
    </>
  )
}
