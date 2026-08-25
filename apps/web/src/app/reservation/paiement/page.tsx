'use client';
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import PaymentLogo from '@/components/PaymentLogo'
import Button from '@/components/ui/Button'
import { paymentChoices } from '@/data/mock'
import { useBookingStore } from '@/store/useBookingStore'
import { initiatePayment, type PaymentMethodCode } from '@/lib/api/payments'
import { extractErrorMessage } from '@/lib/api/errors'

const METHOD_BY_CHOICE: Record<string, PaymentMethodCode> = {
  mtn: 'MTN',
  orange: 'ORANGE',
  moov: 'MOOV',
  wave: 'WAVE',
  mastercard: 'CARD',
  visa: 'CARD',
}

export default function BookingPayment() {
  const router = useRouter()
  const [selected, setSelected] = useState('mtn')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const choice = paymentChoices.find((c) => c.id === selected)
  const booking = useBookingStore((s) => s.booking)

  const handleConfirm = async () => {
    if (!booking) {
      router.replace('/')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { paymentUrl } = await initiatePayment(booking.id, METHOD_BY_CHOICE[selected] ?? 'CARD')
      window.location.href = paymentUrl
    } catch (err) {
      // CinetPay n'est pas encore configuré (pas de clés sandbox) : le backend
      // renvoie un message clair (503) plutôt qu'une fausse confirmation.
      setError(extractErrorMessage(err, "Le paiement en ligne n'est pas encore configuré. Réessayez plus tard."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className="text-2xl font-extrabold text-secondary">
        Choisissez votre moyen de paiement
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Choisissez votre moyen de paiement pour finaliser en toute sécurité.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {paymentChoices.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelected(c.id)}
            className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-colors ${
              selected === c.id ? 'border-secondary bg-pastel' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <PaymentLogo method={c.logo} className="h-10 w-16" />
            <span className="text-sm font-bold">{c.label}</span>
            <span className="flex items-center gap-1 text-[11px] text-gray-500">
              <Lock className="size-3 text-secondary" /> Paiement 100% sécurisé
            </span>
          </button>
        ))}
      </div>

      {/* Saisie du numéro */}
      <div className="mt-5 rounded-2xl bg-gray-100 p-4">
        <p className="text-sm font-bold">{choice?.label ?? 'Mobile Money'}</p>
        <div className="relative mt-2">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={`+225 •••• (${choice?.sub ?? ''})`}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-11 text-sm outline-none focus:border-secondary"
          />
          <Lock className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-secondary" />
        </div>
        {phone && (
          <p className="mt-2 text-xs text-gray-600 font-medium">
            Le paiement sera initié vers le numéro : <span className="font-bold">{phone}</span>
          </p>
        )}
        <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
          <Lock className="size-3 text-secondary" /> Paiement 100% sécurisé
        </p>
      </div>

      {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}

      <Button size="lg" className="mt-5 w-full" onClick={handleConfirm} disabled={loading}>
        {loading ? 'Traitement...' : 'Confirmer le paiement'}
      </Button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500">
        <Lock className="size-3.5 text-secondary" /> Sécurité du paiement • Paiement 100% sécurisé
      </p>
    </>
  )
}
