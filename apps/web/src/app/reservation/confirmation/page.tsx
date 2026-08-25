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

/** Génère un reçu HTML dans un nouvel onglet et déclenche l'impression (→ PDF). */
function downloadReceipt(params: {
  bookingRef: string; title: string; location: string;
  startStr: string; endStr: string; details: string;
  total: number; deposit: number; userName: string;
}) {
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
    <title>Reçu ${params.bookingRef}</title>
    <style>body{font-family:sans-serif;max-width:600px;margin:40px auto;color:#111}
    h1{color:#e97c2a}table{width:100%;border-collapse:collapse;margin-top:16px}
    td{padding:8px 4px;border-bottom:1px solid #eee}td:last-child{text-align:right;font-weight:600}
    .total{font-size:1.2em;color:#e97c2a}.footer{margin-top:32px;font-size:12px;color:#888}
    @media print{button{display:none}}</style></head>
  <body>
    <h1>Babydja — Reçu de réservation</h1>
    <p><strong>Référence :</strong> ${params.bookingRef}</p>
    <p><strong>Client :</strong> ${params.userName}</p>
    <table>
      <tr><td>Établissement</td><td>${params.title}</td></tr>
      <tr><td>Adresse</td><td>${params.location}</td></tr>
      <tr><td>Dates</td><td>${params.startStr} – ${params.endStr}</td></tr>
      <tr><td>Détails</td><td>${params.details}</td></tr>
      <tr class="total"><td>Total</td><td>${fcfa(params.total)}</td></tr>
      <tr><td>Acompte versé</td><td>${fcfa(params.deposit)}</td></tr>
    </table>
    <p class="footer">Merci pour votre confiance. Ce document tient lieu de reçu officiel.</p>
    <button onclick="window.print()" style="margin-top:24px;padding:10px 24px;background:#e97c2a;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px">Imprimer / Enregistrer en PDF</button>
  </body></html>`
  const w = window.open('', '_blank')
  if (w) { w.document.write(html); w.document.close(); w.focus(); w.print(); }
}

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
        <Button
          size="lg"
          className="w-full"
          onClick={() => downloadReceipt({
            bookingRef: booking.bookingRef,
            title,
            location,
            startStr,
            endStr,
            details,
            total: Number(booking.totalAmount),
            deposit: Number(booking.depositAmount),
            userName: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Client Babydja',
          })}
        >
          Télécharger le reçu <Download className="size-4" />
        </Button>
        <Button href="/compte/reservations" variant="secondary" size="lg" className="w-full">
          Voir mes réservations <ListChecks className="size-4" />
        </Button>
      </div>
    </>
  )
}
