'use client';

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { Pencil, User, Mail, Phone, MapPin, TreePalm, Save, X, Camera, Info, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import Avatar from '@/components/Avatar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAuthStore } from '@/store/useAuthStore'
import { updateMe, uploadAvatar } from '@/lib/api/auth'
import { extractErrorMessage } from '@/lib/api/errors'

const profileSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse e-mail invalide').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function Informations() {
  const { user, setSession, accessToken, refreshToken } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      address: '',
    },
  })

  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        address: user.address || '',
      })
    }
  }, [user, reset])

  if (!mounted) return null

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || user?.phone || 'Utilisateur'

  const handlePhotoClick = () => fileInputRef.current?.click()

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La photo ne doit pas dépasser 5 Mo.')
      return
    }

    setUploadingAvatar(true)
    try {
      const updatedUser = await uploadAvatar(file)
      if (accessToken && refreshToken) {
        setSession({ accessToken, refreshToken, user: updatedUser })
      }
      toast.success('Photo de profil mise à jour avec succès.')
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Erreur lors de la mise à jour de la photo.'))
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const onSubmit = async (data: ProfileFormValues) => {
    setLoading(true)
    try {
      const updatedUser = await updateMe({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        address: data.address,
      })
      
      if (accessToken && refreshToken) {
        setSession({ accessToken, refreshToken, user: updatedUser })
      }
      setIsEditing(false)
      toast.success('Vos informations ont été mises à jour.')
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Erreur lors de la mise à jour.'))
    } finally {
      setLoading(false)
    }
  }

  const handleChangePhoneRequest = () => {
    toast.info('Pour changer votre numéro de téléphone, veuillez contacter le support client à support@babydja.com ou via la messagerie.')
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
      <h1 className="text-2xl font-extrabold mb-6">Mes informations</h1>

      <section className="relative overflow-hidden rounded-2xl border border-gray-100 p-6">
        <TreePalm className="absolute -left-4 bottom-0 size-24 text-secondary/15" aria-hidden="true" />
        <TreePalm className="absolute -right-2 top-2 size-16 text-primary/15" aria-hidden="true" />
        <div className="relative flex flex-col items-start gap-5 sm:flex-row">
          {/* ─── Avatar avec upload ─── */}
          <div className="relative shrink-0">
            {user?.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={displayName}
                width={80}
                height={80}
                unoptimized
                className={`size-20 rounded-full object-cover border-4 border-white shadow-md ${uploadingAvatar ? 'opacity-50' : ''}`}
              />
            ) : (
              <div className={`${uploadingAvatar ? 'opacity-50' : ''}`}>
                <Avatar name={displayName} size="xl" />
              </div>
            )}
            
            {uploadingAvatar ? (
               <div className="absolute inset-0 flex items-center justify-center">
                 <Loader2 className="size-6 text-primary animate-spin" />
               </div>
            ) : (
              <button
                aria-label="Modifier la photo de profil"
                onClick={handlePhotoClick}
                className="absolute -right-1 -top-1 grid size-8 place-items-center rounded-full bg-white shadow hover:bg-gray-50 transition-colors"
              >
                <Camera className="size-4 text-secondary" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
              disabled={uploadingAvatar}
            />
          </div>

          <div className="flex-1 w-full max-w-md">
            {!isEditing ? (
              <>
                <Button className="mb-4 w-40" onClick={() => setIsEditing(true)}>
                  <Pencil className="size-4 mr-2" /> Modifier
                </Button>
                <ul className="flex flex-col gap-3 text-sm">
                  <li className="flex items-center gap-2.5 font-bold text-base">
                    <User className="size-4 text-secondary shrink-0" /> {displayName}
                  </li>
                  {user?.email && (
                    <li className="flex items-center gap-2.5 text-gray-600">
                      <Mail className="size-4 text-secondary shrink-0" /> {user.email}
                    </li>
                  )}
                  {user?.phone && (
                    <li className="flex items-center gap-2.5 text-gray-600">
                      <Phone className="size-4 text-secondary shrink-0" /> {user.phone}
                    </li>
                  )}
                  <li className="flex items-center gap-2.5 text-gray-600">
                    <MapPin className="size-4 text-secondary shrink-0" />
                    {user?.address ? user.address : <span className="italic text-gray-400 text-xs">Aucune adresse renseignée.</span>}
                  </li>
                </ul>
              </>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 bg-white/80 p-4 rounded-xl backdrop-blur-sm border border-gray-100">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Prénom"
                      {...register('firstName')}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>}
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Nom"
                      {...register('lastName')}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>}
                  </div>
                </div>
                
                <div>
                  <Input
                    icon={Mail}
                    type="email"
                    placeholder="E-mail"
                    {...register('email')}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>

                {/* Téléphone désactivé avec explication visible et action */}
                <div>
                  <div className="relative">
                    <Input
                      icon={Phone}
                      type="tel"
                      placeholder="Téléphone"
                      value={user?.phone || ''}
                      disabled
                    />
                    <button 
                      type="button" 
                      onClick={handleChangePhoneRequest}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary hover:underline"
                    >
                      Modifier
                    </button>
                  </div>
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
                    <Info className="size-3.5 shrink-0 text-gray-400" />
                    Numéro sécurisé. Utilisez le bouton pour faire une demande de changement.
                  </p>
                </div>

                {/* Adresse modifiable */}
                <div>
                  <Input
                    icon={MapPin}
                    type="text"
                    placeholder="Adresse (ex : Cocody, Abidjan)"
                    {...register('address')}
                    className={errors.address ? 'border-red-500' : ''}
                  />
                  {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
                </div>

                <div className="flex gap-3 mt-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" /> Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="size-4 mr-2" /> Enregistrer
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setIsEditing(false); reset(); }} disabled={loading}>
                    <X className="size-4 mr-2" /> Annuler
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Indicateur de vérification email */}
      {user?.email && !user.isEmailVerified && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          ⚠️ Votre adresse e-mail n&apos;est pas encore vérifiée. Vérifiez votre boîte mail.
        </div>
      )}
    </div>
  )
}
