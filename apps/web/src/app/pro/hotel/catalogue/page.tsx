'use client';

import { useState } from 'react'
import NextImage from 'next/image'
import { Plus, Search, Edit, Trash2, Image as ImageIcon, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { fcfa } from '@/utils/formatters'
import { useCatalogStore, type EnrichedRoom } from '@/store/useCatalogStore'

// Brouillon du formulaire : prix/capacité restent des chaînes tant que le champ
// n'a pas été modifié (valeur initiale vide), puis deviennent des nombres via
// Number(e.target.value) dans les onChange ci-dessous.
interface RoomDraft {
  id?: string;
  name: string;
  price: number | string;
  capacity: number | string;
  status: string;
  images: string[];
}

export default function HotelCatalog() {
  const rooms = useCatalogStore(state => state.rooms)
  const addRoom = useCatalogStore(state => state.addRoom)
  const updateRoom = useCatalogStore(state => state.updateRoom)
  const deleteRoom = useCatalogStore(state => state.deleteRoom)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingRoom, setEditingRoom] = useState<RoomDraft | null>(null)

  const filteredRooms = rooms.filter((r) => r.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleOpenModal = (room: EnrichedRoom | null = null) => {
    if (room) {
      setEditingRoom({ ...room, images: room.images && room.images.length > 0 ? [...room.images] : [''] })
    } else {
      setEditingRoom({ name: '', price: '', capacity: '', status: 'Disponible', images: [''] })
    }
  }

  const handleCloseModal = () => {
    setEditingRoom(null)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRoom) return
    // Retirer les URLs vides avant de sauvegarder
    const cleanedImages = editingRoom.images.filter((img) => img.trim() !== '')
    const roomToSave = { ...editingRoom, images: cleanedImages }

    if (editingRoom.id) {
      updateRoom(roomToSave as EnrichedRoom)
    } else {
      addRoom(roomToSave as EnrichedRoom)
    }
    handleCloseModal()
  }

  const handleDelete = (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette chambre ?")) {
      deleteRoom(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catalogue des Chambres</h1>
          <p className="text-sm text-gray-500">Gérez les chambres, suites et hébergements de votre hôtel.</p>
        </div>
        <Button className="shrink-0" onClick={() => handleOpenModal()}>
          <Plus className="size-5" />
          Ajouter une chambre
        </Button>
      </div>

      {/* Filtres et recherche */}
      <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Rechercher une chambre..." 
            className="pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Liste des chambres (Grille) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRooms.map((room) => (
          <div key={room.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md">
            <div className="relative aspect-video bg-gray-100">
              {room.images && room.images.length > 0 ? (
                <NextImage src={room.images[0]} alt={room.name} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="size-8 text-gray-300" />
                </div>
              )}
              {room.images && room.images.length > 1 && (
                <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
                  + {room.images.length - 1} photo{room.images.length > 2 ? 's' : ''}
                </div>
              )}
              <div className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur">
                <span className={
                  room.status === 'Disponible' ? 'text-green-600' :
                  room.status === 'Occupée' ? 'text-red-600' : 'text-orange-500'
                }>
                  {room.status}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900">{room.name}</h3>
              <p className="text-sm text-gray-500">Capacité : {room.capacity} pers.</p>
              
              <div className="mt-4 flex items-center justify-between">
                <p className="text-lg font-black text-secondary">{fcfa(room.price)} <span className="text-sm font-medium text-gray-500">/ nuit</span></p>
                
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(room)} className="rounded-lg p-2 text-gray-400 hover:bg-orange-50 hover:text-secondary transition-colors">
                    <Edit className="size-4" />
                  </button>
                  <button onClick={() => handleDelete(room.id)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredRooms.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            Aucune chambre ne correspond à votre recherche.
          </div>
        )}
      </div>

      {/* Modal d'édition/ajout */}
      {editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl my-8">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editingRoom.id ? 'Modifier la chambre' : 'Ajouter une chambre'}
              </h2>
              <button type="button" onClick={handleCloseModal} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900">
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nom de la chambre</label>
                <Input 
                  required 
                  value={editingRoom.name} 
                  onChange={e => setEditingRoom({...editingRoom, name: e.target.value})} 
                  placeholder="Ex: Chambre Deluxe"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Prix par nuit (FCFA)</label>
                  <Input 
                    type="number"
                    required 
                    value={editingRoom.price} 
                    onChange={e => setEditingRoom({...editingRoom, price: Number(e.target.value)})} 
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Capacité</label>
                  <Input 
                    type="number"
                    required 
                    value={editingRoom.capacity} 
                    onChange={e => setEditingRoom({...editingRoom, capacity: Number(e.target.value)})} 
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Statut</label>
                <select 
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-secondary focus:bg-white focus:ring-4 focus:ring-secondary/10"
                  value={editingRoom.status}
                  onChange={e => setEditingRoom({...editingRoom, status: e.target.value})}
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Occupée">Occupée</option>
                  <option value="En nettoyage">En nettoyage</option>
                </select>
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Photos de la chambre (URLs)</label>
                <div className="space-y-3">
                  {editingRoom.images.map((url: string, index: number) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input 
                        value={url} 
                        onChange={e => {
                          const newImages = [...editingRoom.images]
                          newImages[index] = e.target.value
                          setEditingRoom({...editingRoom, images: newImages})
                        }} 
                        placeholder="https://..."
                        className="flex-1"
                      />
                      <button 
                        type="button" 
                        onClick={() => {
                          const newImages = editingRoom.images.filter((_: string, i: number) => i !== index)
                          // Garder au moins un champ vide
                          if (newImages.length === 0) newImages.push('')
                          setEditingRoom({...editingRoom, images: newImages})
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
                    onClick={() => setEditingRoom({...editingRoom, images: [...editingRoom.images, '']})}
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
