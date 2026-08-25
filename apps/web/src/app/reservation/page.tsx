'use client';
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, CalendarDays, User, Users, Mail, Phone, Lock } from 'lucide-react'
import Placeholder from '@/components/Placeholder'
import Toggle from '@/components/ui/Toggle'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { hotelConfig } from '@/data/mock'
import { fcfa } from '@/utils/formatters'
import { useBookingStore } from '@/store/useBookingStore'
import { useAuthStore } from '@/store/useAuthStore'

export default function BookingSummary() {
  const router = useRouter()
  const [payFull, setPayFull] = useState(true)
  const [submitError, setSubmitError] = useState('')
  const { room, car, itemType, carOptions, getDetails, createBooking, creating } = useBookingStore()
  const { isAuthenticated, openDrawer, user } = useAuthStore()

  const activeItem = itemType === 'car' ? car : room

  if (!activeItem) {
    // Si l'utilisateur arrive ici sans sélection, on le redirige
    if (typeof window !== 'undefined') router.replace('/')
    return null
  }

  const details = getDetails()
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || ''

  return (
    <>
      <h1 className="text-2xl font-extrabold text-secondary">Détails de votre réservation</h1>

      {/* Carte du séjour ou de la location */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200">
        <Placeholder kind={activeItem.kind || 'car'} className="h-36 w-full" />
        <div className="p-4 text-sm">
          <p className="font-bold">{itemType === 'car' ? activeItem.name : hotelConfig.name}</p>
          <p className="mt-1 flex items-center gap-1.5 text-gray-600">
            <MapPin className="size-4 text-secondary" /> {itemType === 'car' ? 'Retrait à Abidjan' : `Abidjan, ${details.dates}`}
          </p>
          <p className="mt-1 flex items-center justify-between text-gray-600">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4 text-secondary" /> {itemType === 'car' ? details.dates : details.details}
            </span>
            <span className="flex items-center gap-1 text-gray-400">
              {itemType === 'car' ? <Users className="size-4" /> : (
                <>
                  <User className="size-4" />
                  <Users className="size-4" />
                </>
              )}
            </span>
          </p>
          {itemType === 'car' && (
            <p className="mt-1 text-xs text-gray-500 font-medium">
              Détails : {details.details}
            </p>
          )}
        </div>
      </div>

      {/* Détails du prix */}
      <h2 className="mt-6 font-bold">Détails du prix</h2>
      <dl className="mt-2 text-sm">
        <div className="flex justify-between py-1">
          <dt>Sous-total</dt>
          <dd className="font-semibold">{fcfa(details.subtotal - (itemType === 'car' ? ((carOptions.driver ? 15000 : 0) + (carOptions.insurance ? 5000 : 0)) * details.nights : 0))}</dd>
        </div>
        {itemType === 'car' && carOptions.driver && (
          <div className="flex justify-between py-1">
            <dt className="text-gray-600">Option: Chauffeur</dt>
            <dd className="font-semibold text-gray-700">{fcfa(15000 * details.nights)}</dd>
          </div>
        )}
        {itemType === 'car' && carOptions.insurance && (
          <div className="flex justify-between py-1">
            <dt className="text-gray-600">Option: Assurance</dt>
            <dd className="font-semibold text-gray-700">{fcfa(5000 * details.nights)}</dd>
          </div>
        )}
        <div className="flex justify-between py-1">
          <dt>Frais</dt>
          <dd className="font-semibold">{fcfa(details.fees)}</dd>
        </div>
        <div className="mt-1 flex justify-between border-t border-gray-100 pt-2 text-base">
          <dt className="font-bold text-primary">Total</dt>
          <dd className="font-extrabold text-primary">{fcfa(details.total)}</dd>
        </div>
      </dl>

      {/* Mode de paiement */}
      <div className="mt-5 flex flex-col gap-3 text-sm">
        <label className="flex items-center justify-between font-medium">
          Payer la totalité ({fcfa(details.total)})
          <Toggle checked={payFull} onChange={() => setPayFull(true)} />
        </label>
        <label className="flex items-center justify-between font-medium">
          Payer un acompte ({fcfa(details.deposit)})
          <Toggle checked={!payFull} onChange={() => setPayFull(false)} />
        </label>
      </div>

      {/* Vos informations */}
      <h2 className="mt-6 font-bold">Vos informations</h2>
      <form
        className="mt-3 flex flex-col gap-3"
        onSubmit={async (e) => {
          e.preventDefault()
          setSubmitError('')
          if (!isAuthenticated) {
            openDrawer('login')
            return
          }
          const booking = await createBooking(payFull ? 'FULL' : 'DEPOSIT')
          if (booking) {
            router.push('/reservation/paiement')
          } else {
            setSubmitError(useBookingStore.getState().createError || 'Impossible de créer la réservation.')
          }
        }}
      >
        <Input icon={User} defaultValue={displayName} placeholder="Nom complet" />
        <Input icon={Mail} type="email" placeholder="Adresse e-mail" defaultValue={user?.email || ''} />
        <Input icon={Phone} type="tel" placeholder="Téléphone" defaultValue={user?.phone || ''} />
        {submitError && <p className="text-sm text-red-600">{submitError}</p>}
        <Button size="lg" className="mt-2 w-full" type="submit" disabled={creating}>
          {creating ? 'Création de la réservation...' : 'Continuer vers le paiement'}
        </Button>
      </form>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500">
        <Lock className="size-3.5 text-secondary" /> Paiement 100% sécurisé
      </p>
    </>
  )
}
