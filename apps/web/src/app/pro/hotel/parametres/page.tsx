'use client';

import { useState } from 'react'
import { Save, UploadCloud, MapPin, Phone, Mail, Building } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function HotelSettings() {
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 1000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres de l'hôtel</h1>
        <p className="text-sm text-gray-500">Gérez les informations publiques et la configuration de votre établissement.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Colonne de gauche (Menu interne ou info) */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
            <h3 className="font-semibold text-gray-900">Photos de l'établissement</h3>
            <p className="mt-1 text-xs text-gray-500">La première image sera utilisée comme couverture.</p>
            
            <div className="mt-4 flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
              <UploadCloud className="size-8 text-gray-400" />
              <span className="mt-2 text-xs font-medium text-gray-500">Ajouter des photos</span>
            </div>
          </div>
        </div>

        {/* Formulaire principal */}
        <div className="md:col-span-2 space-y-6">
          {/* Section Informations Générales */}
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Building className="size-5 text-secondary" />
              <h2 className="text-lg font-bold text-gray-900">Informations Générales</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nom de l'établissement</label>
                <Input defaultValue="Hôtel Ivoire Palace" />
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary min-h-[100px]"
                  defaultValue="Un hôtel luxueux au cœur de la ville offrant une vue imprenable."
                />
              </div>
            </div>
          </div>

          {/* Section Coordonnées */}
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <MapPin className="size-5 text-secondary" />
              <h2 className="text-lg font-bold text-gray-900">Coordonnées</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Adresse complète</label>
                <Input defaultValue="Boulevard Hassan II, Cocody" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Ville</label>
                <Input defaultValue="Abidjan" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Code postal (Optionnel)</label>
                <Input defaultValue="" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="size-3.5" /> Téléphone
                </label>
                <Input defaultValue="+225 01 02 03 04 05" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="size-3.5" /> Email Contact
                </label>
                <Input defaultValue="contact@ivoirepalace.ci" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button size="lg" onClick={handleSave} className={isSaving ? 'opacity-70' : ''}>
              <Save className="size-5" />
              {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
