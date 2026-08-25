'use client';
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, TreePalm, Sun, MapPin, CalendarDays, Users, Download, ListChecks } from 'lucide-react'
import Placeholder from '@/components/Placeholder'
import Button from '@/components/ui/Button'
import { fcfa } from '@/utils/formatters'
import { hotelConfig } from '@/data/mock'
import { useAuthStore } from '@/store/useAuthStore'
import { useBookingStore } from '@/store/useBookingStore'

export default function BookingConfirmation() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { booking, room, car, itemType } = useBookingStore()
  const item = itemType === 'car' ? car : room

  useEffect(() => {
    if (!booking) router.replace('/')
  }, [booking, router])

  if (!booking) return null

  const startStr = new Date(booking.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  const endStr = new Date(booking.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  const title = itemType === 'car' ? item?.name ?? 'Votre location' : hotelConfig.name
  const location = itemType === 'car' ? 'Retrait à Abidjan' : hotelConfig.address
  const nights = Math.max(1, Math.round((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / 86_400_000))
  const details = itemType === 'car' ? `${nights} jour${nights > 1 ? 's' : ''}` : `${nights} nuit${nights > 1 ? 's' : ''}, 1 chambre`

  return (
    <>
      <h1 className="text-center text-3xl font-extrabold text-secondary">Félicitations !</h1>
      <p className="mt-1 text-center font-semibold">Réservation validée !</p>

      {/* Coche verte + décor */}
      <div className="relative mx-auto mt-6 w-fit" aria-hidden="true">
        <TreePalm className="absolute -left-20 -top-2 size-14 text-secondary/70" />
        <Sun className="absolute -right-20 -top-4 size-12 text-primary" />
        <span className="grid size-24 place-items-center rounded-full bg-secondary shadow-lg">
          <Check className="size-14 text-white" strokeWidth={3.5} />
        </span>
      </div>

      <h2 className="mt-6 text-center text-xl font-extrabold">
        Votre réservation est confirmée !
      </h2>
      <p className="mt-1 text-center text-sm font-bold">Confirmation {booking.bookingRef}</p>
      {user?.phone && (
        <p className="mt-2 text-center text-sm text-gray-600">
          Un SMS de confirmation a été envoyé au {user.phone}
        </p>
      )}

      {/* Récapitulatif */}
      <div className="mt-5 flex gap-3 rounded-2xl border border-gray-200 p-3">
        <Placeholder kind={itemType === 'car' ? 'car' : 'room'} className="h-24 w-24 shrink-0 rounded-xl" />
        <div className="text-sm">
          <p className="font-bold">{title}</p>
          <p className="mt-1 flex items-center gap-1.5 text-gray-600">
            <MapPin className="size-3.5 text-secondary" /> {location}
          </p>
          <p className="flex items-center gap-1.5 text-gray-600">
            <CalendarDays className="size-3.5 text-secondary" /> {startStr} – {endStr}
          </p>
          <p className="flex items-center gap-1.5 text-gray-600">
            <Users className="size-3.5 text-secondary" /> {details}
          </p>
          <p className="mt-1 font-bold text-primary">Total : {fcfa(Number(booking.totalAmount))}</p>
        </div>
      </div>

      {user?.email && (
        <p className="mt-4 text-center text-sm text-gray-600">
          Détails envoyés par e-mail à <span className="font-semibold text-ink">{user.email}</span>
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3">
        <Button size="lg" className="w-full">
          Télécharger le reçu <Download className="size-4" />
        </Button>
        <Button href="/compte/reservations" variant="secondary" size="lg" className="w-full">
          Voir mes réservations <ListChecks className="size-4" />
        </Button>
      </div>
    </>
  )
}
