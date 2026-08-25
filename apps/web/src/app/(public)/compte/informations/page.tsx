'use client';

import { useState, useEffect } from 'react'
import { Pencil, User, Mail, Phone, MapPin, TreePalm, Save, X } from 'lucide-react'
import Avatar from '@/components/Avatar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAuthStore } from '@/store/useAuthStore'
import { updateMe } from '@/lib/api/auth'

export default function Informations() {
  const { user, setSession, accessToken, refreshToken } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || user?.phone || 'Utilisateur'

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleSave = async () => {
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const updatedUser = await updateMe({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      })
      if (accessToken && refreshToken) {
        setSession({ accessToken, refreshToken, user: updatedUser })
      }
      setIsEditing(false)
      setSuccess('Vos informations ont été mises à jour.')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erreur lors de la mise à jour.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
      <h1 className="text-2xl font-extrabold mb-6">Mes informations</h1>
      
      {success && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          ✓ {success}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      <section className="relative overflow-hidden rounded-2xl border border-gray-100 p-6">
        <TreePalm className="absolute -left-4 bottom-0 size-24 text-secondary/15" aria-hidden="true" />
        <TreePalm className="absolute -right-2 top-2 size-16 text-primary/15" aria-hidden="true" />
        <div className="relative flex flex-col items-start gap-5 sm:flex-row">
          <div className="relative">
            <Avatar name={displayName} size="xl" />
            <button
              aria-label="Modifier la photo"
              className="absolute -right-1 -top-1 grid size-8 place-items-center rounded-full bg-white shadow"
            >
              <Pencil className="size-4 text-secondary" />
            </button>
          </div>
          <div className="flex-1 w-full max-w-md">
            {!isEditing ? (
              <>
                <Button className="mb-4 w-40" onClick={() => setIsEditing(true)}>Modifier</Button>
                <ul className="flex flex-col gap-2 text-sm">
                  <li className="flex items-center gap-2.5 font-bold text-base">
                    <User className="size-4 text-secondary" /> {displayName}
                  </li>
                  {user?.email && (
                    <li className="flex items-center gap-2.5 text-gray-600">
                      <Mail className="size-4 text-secondary" /> {user.email}
                    </li>
                  )}
                  {user?.phone && (
                    <li className="flex items-center gap-2.5 text-gray-600">
                      <Phone className="size-4 text-secondary" /> {user.phone}
                    </li>
                  )}
                  <li className="flex items-center gap-2.5 text-gray-400 italic text-xs">
                    <MapPin className="size-4 text-secondary" /> Adresse non renseignée
                  </li>
                </ul>
              </>
            ) : (
              <div className="flex flex-col gap-4 bg-white/80 p-4 rounded-xl backdrop-blur-sm border border-gray-100">
                <div className="flex gap-4">
                  <Input 
                    placeholder="Prénom" 
                    value={formData.firstName} 
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })} 
                  />
                  <Input 
                    placeholder="Nom" 
                    value={formData.lastName} 
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })} 
                  />
                </div>
                <Input 
                  icon={Mail} 
                  type="email" 
                  placeholder="E-mail" 
                  value={formData.email} 
                  onChange={e => setFormData({ ...formData, email: e.target.value })} 
                />
                <Input 
                  icon={Phone} 
                  type="tel" 
                  placeholder="Téléphone" 
                  value={formData.phone} 
                  disabled 
                  title="Le téléphone ne peut pas être modifié"
                />
                
                <div className="flex gap-3 mt-2">
                  <Button onClick={handleSave} disabled={loading} className="flex-1">
                    <Save className="size-4 mr-2" /> {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>
                    <X className="size-4 mr-2" /> Annuler
                  </Button>
                </div>
              </div>
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
