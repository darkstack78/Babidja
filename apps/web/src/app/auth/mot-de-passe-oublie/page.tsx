'use client';

import { useState } from 'react'
import Link from 'next/link'
import { Mail, CircleCheck } from 'lucide-react'
import Button from '@/components/ui/Button'
import { AuthCard } from '@/components/auth/AuthShared'

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)

  return (
    <AuthCard showBack>
      <h1 className="mt-6 text-center text-2xl font-extrabold">Mot de passe oublié ?</h1>
      <p className="mt-2 text-center text-sm text-gray-600">
        Saisissez l’e-mail ou le téléphone associé à votre compte.
      </p>

      <form
        className="mt-5 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          setSent(true)
        }}
      >
        <div className="relative">
          <input
            type="text"
            placeholder="E-mail ou Téléphone"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-11 text-sm outline-none placeholder:text-gray-400 focus:border-secondary"
          />
          <Mail className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        </div>
        <Button size="lg" className="w-full" onClick={() => setSent(true)}>
          Réinitialiser
        </Button>
      </form>

      {sent && (
        <div className="mt-6 text-center">
          <CircleCheck className="mx-auto size-10 fill-secondary text-white" />
          <p className="mt-2 font-bold">E-mail de réinitialisation envoyé</p>
          <p className="mt-1 text-sm text-gray-600">
            Veuillez vérifier votre boîte de réception pour les instructions.
          </p>
        </div>
      )}

      <p className="mt-6 text-center text-sm">
        <Link href="/" className="font-semibold text-secondary hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </AuthCard>
  )
}
