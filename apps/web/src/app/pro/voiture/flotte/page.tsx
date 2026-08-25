'use client';

import { useState } from 'react'
import NextImage from 'next/image'
import { Plus, Search, Edit, Trash2, Image as ImageIcon, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { fcfa } from '@/utils/formatters'
import { useCatalogStore, type EnrichedCar } from '@/store/useCatalogStore'

// Brouillon du formulaire : prix reste une chaîne tant que le champ n'a pas
// été modifié (valeur initiale vide), puis devient un nombre via
// Number(e.target.value) dans les onChange ci-dessous.
interface CarDraft {
  id?: string;
  name: string;
  price: number | string;
  type: string;
  transmission: string;
  seats: number;
  status: string;
  images: string[];
}

export default function CarFleet() {
  const cars = useCatalogStore(state => state.cars)
  const addCar = useCatalogStore(state => state.addCar)
  const updateCar = useCatalogStore(state => state.updateCar)
  const deleteCar = useCatalogStore(state => state.deleteCar)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingCar, setEditingCar] = useState<CarDraft | null>(null)

  const filteredCars = cars.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleOpenModal = (car: EnrichedCar | null = null) => {
    if (car) {
      setEditingCar({ ...car, images: car.images && car.images.length > 0 ? [...car.images] : [''] })
    } else {
      setEditingCar({ name: '', price: '', type: 'Berline', transmission: 'Automatique', seats: 5, status: 'Disponible', images: [''] })
    }
  }

  const handleCloseModal = () => {
    setEditingCar(null)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCar) return
    const cleanedImages = editingCar.images.filter((img) => img.trim() !== '')
    const carToSave = { ...editingCar, images: cleanedImages }

    if (editingCar.id) {
      updateCar(carToSave as EnrichedCar)
    } else {
      addCar(carToSave as EnrichedCar)
    }
    handleCloseModal()
  }

  const handleDelete = (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce véhicule ?")) {
      deleteCar(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flotte (Véhicules)</h1>
          <p className="text-sm text-gray-500">Gérez votre parc automobile, vos prix et les disponibilités.</p>
        </div>
        <Button className="shrink-0" onClick={() => handleOpenModal()}>
          <Plus className="size-5" />
          Ajouter un véhicule
        </Button>
      </div>

      <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Rechercher un véhicule..." 
            className="pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCars.map((car) => (
          <div key={car.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md">
            <div className="relative aspect-video bg-gray-100">
              {car.images && car.images.length > 0 ? (
                <NextImage src={car.images[0]} alt={car.name} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="size-8 text-gray-300" />
                </div>
              )}
              {car.images && car.images.length > 1 && (
                <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
                  + {car.images.length - 1} photo{car.images.length > 2 ? 's' : ''}
                </div>
              )}
              <div className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur">
                <span className={
                  car.status === 'Disponible' ? 'text-green-600' :
                  car.status === 'En location' ? 'text-blue-600' : 'text-orange-500'
                }>
                  {car.status}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900">{car.name}</h3>
              <p className="text-sm text-gray-500">{car.type} • {car.transmission} • {car.seats} places</p>
              
              <div className="mt-4 flex items-center justify-between">
                <p className="text-lg font-black text-secondary">{fcfa(car.price)} <span className="text-sm font-medium text-gray-500">/ jour</span></p>
                
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(car)} className="rounded-lg p-2 text-gray-400 hover:bg-orange-50 hover:text-secondary transition-colors">
                    <Edit className="size-4" />
                  </button>
                  <button onClick={() => handleDelete(car.id)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredCars.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            Aucun véhicule ne correspond à votre recherche.
          </div>
        )}
      </div>

      {editingCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl my-8">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editingCar.id ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
              </h2>
              <button type="button" onClick={handleCloseModal} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900">
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Modèle du véhicule</label>
                <Input 
                  required 
                  value={editingCar.name} 
                  onChange={e => setEditingCar({...editingCar, name: e.target.value})} 
                  placeholder="Ex: Toyota Corolla"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Prix par jour (FCFA)</label>
                  <Input 
                    type="number"
                    required 
                    value={editingCar.price} 
                    onChange={e => setEditingCar({...editingCar, price: Number(e.target.value)})} 
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                  <select 
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-secondary focus:bg-white focus:ring-4 focus:ring-secondary/10"
                    value={editingCar.type}
                    onChange={e => setEditingCar({...editingCar, type: e.target.value})}
                  >
                    <option value="Berline">Berline</option>
                    <option value="SUV">SUV</option>
                    <option value="Citadine">Citadine</option>
                    <option value="4x4">4x4</option>
                    <option value="Utilitaire">Utilitaire</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Transmission</label>
                  <select 
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-secondary focus:bg-white focus:ring-4 focus:ring-secondary/10"
                    value={editingCar.transmission}
                    onChange={e => setEditingCar({...editingCar, transmission: e.target.value})}
                  >
                    <option value="Automatique">Automatique</option>
                    <option value="Manuelle">Manuelle</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Places</label>
                  <Input 
                    type="number"
                    required 
                    value={editingCar.seats} 
                    onChange={e => setEditingCar({...editingCar, seats: Number(e.target.value)})} 
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Statut</label>
                <select 
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-secondary focus:bg-white focus:ring-4 focus:ring-secondary/10"
                  value={editingCar.status}
                  onChange={e => setEditingCar({...editingCar, status: e.target.value})}
                >
                  <option value="Disponible">Disponible</option>
                  <option value="En location">En location</option>
                  <option value="En maintenance">En maintenance</option>
                </select>
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Photos (URLs)</label>
                <div className="space-y-3">
                  {editingCar.images.map((url: string, index: number) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input 
                        value={url} 
                        onChange={e => {
                          const newImages = [...editingCar.images]
                          newImages[index] = e.target.value
                          setEditingCar({...editingCar, images: newImages})
                        }} 
                        placeholder="https://..."
                        className="flex-1"
                      />
                      <button 
                        type="button" 
                        onClick={() => {
                          const newImages = editingCar.images.filter((_: string, i: number) => i !== index)
                          if (newImages.length === 0) newImages.push('')
                          setEditingCar({...editingCar, images: newImages})
                        }}
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setEditingCar({...editingCar, images: [...editingCar.images, '']})}
                    className="w-full text-sm border-dashed"
                  >
                    <Plus className="size-4 mr-2" />
                    Ajouter une photo
                  </Button>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Annuler
                </Button>
                <Button type="submit">
                  Enregistrer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
