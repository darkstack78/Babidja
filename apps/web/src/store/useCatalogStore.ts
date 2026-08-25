import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { rooms as initialRooms, cars as initialCars } from '../data/mock'
import type { Room, Vehicle } from '@/types/catalog'

// Démo locale pour le tableau de bord pro (Phase 2 : CRUD réel sur
// GET/POST/PATCH /tenant/:tenantId/catalogue, non encore branché côté backend).
// Volontairement déconnecté de la vitrine publique (src/lib/api/catalog.ts, qui
// lit désormais le vrai backend) : éditer ici ne doit pas laisser croire que
// la modification est persistée côté serveur.

export interface EnrichedRoom extends Room {
  status: string
  capacity: number
}

export interface EnrichedCar extends Vehicle {
  status: string
  type: string
  seats: number
}

const enrichedRooms: EnrichedRoom[] = initialRooms.map((r) => ({
  ...r,
  status: 'Disponible',
  images: r.images || [],
  capacity: r.capacityAdults + (r.capacityChildren || 0),
}))

const enrichedCars: EnrichedCar[] = initialCars.map((c) => ({
  ...c,
  status: 'Disponible',
  images: c.images || [],
  type: c.name.toLowerCase().includes('suv') || c.name.toLowerCase().includes('prado') ? 'SUV' :
        c.name.toLowerCase().includes('citadine') || c.name.toLowerCase().includes('clio') ? 'Citadine' : 'Berline',
  seats: 5,
}))

interface CatalogState {
  rooms: EnrichedRoom[]
  cars: EnrichedCar[]
  addRoom: (room: Omit<EnrichedRoom, 'id'> & { id?: string }) => void
  updateRoom: (room: EnrichedRoom) => void
  deleteRoom: (id: string) => void
  addCar: (car: Omit<EnrichedCar, 'id'> & { id?: string }) => void
  updateCar: (car: EnrichedCar) => void
  deleteCar: (id: string) => void
}

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set) => ({
      rooms: enrichedRooms,
      cars: enrichedCars,
      addRoom: (room) => set((state) => ({ rooms: [...state.rooms, { ...room, id: Date.now().toString() } as EnrichedRoom] })),
      updateRoom: (room) => set((state) => ({ rooms: state.rooms.map((r) => r.id === room.id ? room : r) })),
      deleteRoom: (id) => set((state) => ({ rooms: state.rooms.filter((r) => r.id !== id) })),
      addCar: (car) => set((state) => ({ cars: [...state.cars, { ...car, id: Date.now().toString() } as EnrichedCar] })),
      updateCar: (car) => set((state) => ({ cars: state.cars.map((c) => c.id === car.id ? car : c) })),
      deleteCar: (id) => set((state) => ({ cars: state.cars.filter((c) => c.id !== id) })),
    }),
    {
      name: 'catalog-storage',
    }
  )
)
