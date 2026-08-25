'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Key, Users } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input, { PasswordInput } from '@/components/ui/Input'
import Logo from '@/components/Logo'
import { useAuthStore } from '@/store/useAuthStore'
import { loginSchema, type LoginFormData } from '@/lib/validators'
import { loginEmail } from '@/lib/api/auth'
import { extractErrorMessage } from '@/lib/api/errors'

export default function HotelLogin() {
  const router = useRouter()
  const setSession = useAuthStore((state) => state.setSession)
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: LoginFormData) => {
    setFormError('')
    setLoading(true)
    try {
      const { accessToken, refreshToken, user } = await loginEmail(data.email, data.password)
      if (user.role !== 'TENANT_ADMIN' && user.role !== 'TENANT_EMPLOYEE') {
        setFormError("Ce compte n'a pas accès à un espace professionnel.")
        return
      }
      setSession({ accessToken, refreshToken, user })
      router.push('/pro/hotel')
    } catch (error) {
      setFormError(extractErrorMessage(error, 'Identifiants invalides.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-gradient-to-br from-orange-100 via-orange-50 to-orange-200 px-4">
      {/* Décor Hôtel */}
      <Building2 className="absolute left-10 top-20 size-32 text-secondary/20" aria-hidden="true" />
      <Key className="absolute right-16 top-32 size-20 text-secondary/30" aria-hidden="true" />
      <Users className="absolute bottom-20 left-20 size-24 text-secondary/20" aria-hidden="true" />

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-gray-100 relative z-10">
        <div className="flex justify-center">
          <Logo variant="pro" />
        </div>
        <p className="mt-1 text-center text-xs font-semibold text-primary">
          Le meilleur, à la manière ivoirienne
        </p>

        <div className="mx-auto mt-6 w-fit rounded-2xl bg-secondary px-6 py-3 text-center text-sm font-extrabold uppercase tracking-wide text-white shadow-sm">
          Espace Gérant Hôtel
        </div>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Input type="email" placeholder="E-mail" {...register('email')} error={errors.email?.message} />
          <PasswordInput placeholder="Mot de passe" {...register('password')} error={errors.password?.message} />
          {formError && <p className="text-sm text-danger">{formError}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
      </div>
    </div>
  )
}
