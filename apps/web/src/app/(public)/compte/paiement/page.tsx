'use client';

import { Star, Trash2, Plus } from 'lucide-react'
import PaymentLogo from '@/components/PaymentLogo'
import Button from '@/components/ui/Button'
import { savedPaymentMethods } from '@/data/mock'

export default function PaymentMethods() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
      <h1 className="text-2xl font-extrabold">Moyens de paiement</h1>

      <div className="mt-5 flex flex-col gap-4">
        {savedPaymentMethods.map((m: any) => (
          <article key={m.id} className="rounded-2xl border border-gray-200 p-4">
            <p className="text-sm font-bold">{m.type}</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-12 w-16 place-items-center overflow-hidden rounded-xl border border-gray-100 bg-white">
                <PaymentLogo method={m.logo} className="h-9 w-14" />
              </span>
              <div>
                <p className="text-sm font-semibold">{m.name}</p>
                <p className="text-sm text-gray-600">{m.number}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {m.favorite ? (
                <Button variant="outlineOrange" size="sm">
                  <Star className="size-4 fill-primary" /> Favori
                </Button>
              ) : (
                <Button variant="outline" size="sm">
                  <Star className="size-4" /> Définir comme favori
                </Button>
              )}
              <Button variant="danger" size="sm">
                <Trash2 className="size-4" /> Supprimer
              </Button>
            </div>
          </article>
        ))}
      </div>

      <Button size="lg" className="mt-6 w-full">
        <Plus className="size-4" /> Ajouter un nouveau moyen de paiement
      </Button>
    </div>
  )
}
