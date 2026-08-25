import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Room, Vehicle } from '@/types/catalog'
import type { Booking, BookingResourceType, PaymentType } from '@/types/booking'
import { createBooking as createBookingApi } from '@/lib/api/bookings'
import { extractErrorMessage } from '@/lib/api/errors'

type BookableItem = Room | Vehicle

interface BookingDetails {
  nights: number
  subtotal: number
  fees: number
  total: number
  deposit: number
  dates: string
  itemType: 'room' | 'car'
  item: BookableItem | null
  details: string
}

interface BookingState {
  itemType: 'room' | 'car'
  arrival: string
  departure: string
  guests: string
  room: Room | null
  car: Vehicle | null
  carOptions: { driver: boolean; insurance: boolean }
  booking: Booking | null
  creating: boolean
  createError: string

  setSearchCriteria: (arrival: string, departure: string, guests: string, itemType?: 'room' | 'car') => void
  setRoom: (room: Room) => void
  setCar: (car: Vehicle) => void
  setCarOptions: (options: { driver: boolean; insurance: boolean }) => void
  getDetails: (overrideItem?: BookableItem | null) => BookingDetails
  createBooking: (paymentType: PaymentType) => Promise<Booking | null>
}

// Dates initiales dynamiques : aujourd'hui et demain
function todayStr() { return new Date().toISOString().split('T')[0] }
function tomorrowStr() {
  const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
  itemType: 'room',
  arrival: todayStr(),
  departure: tomorrowStr(),
  guests: '2 Adultes',
  room: null,
  car: null,
  carOptions: { driver: false, insurance: false },
  booking: null,
  creating: false,
  createError: '',

  setSearchCriteria: (arrival, departure, guests, itemType = 'room') => set({ arrival, departure, guests, itemType }),
  setRoom: (room) => set({ room, itemType: 'room' }),
  setCar: (car) => set({ car, itemType: 'car' }),
  setCarOptions: (carOptions) => set({ carOptions }),

  getDetails: (overrideItem) => {
    const { arrival, departure, room, car, itemType, guests } = get()

    let activeItem: BookableItem | null = overrideItem ?? null
    let activeType: 'room' | 'car' = itemType

    if (overrideItem) {
      activeType = overrideItem.kind === 'car' ? 'car' : 'room'
    } else {
      activeItem = itemType === 'car' ? car : room
    }

    const startDate = new Date(arrival)
    const endDate = new Date(departure)
    const nights = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))

    let subtotal = activeItem ? activeItem.price * nights : 0
    if (activeType === 'car') {
      const { carOptions } = get()
      if (carOptions.driver) subtotal += 15000 * nights
      if (carOptions.insurance) subtotal += 5000 * nights
    }
    const fees = 5000 // Frais de service fixes
    const total = subtotal + fees
    const deposit = total * 0.30

    const startStr = startDate.toLocaleDateString('fr-FR', { day: 'numeric' })
    const endStr = endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    const dates = `${startStr} – ${endStr}`

    return {
      nights,
      subtotal,
      fees,
      total,
      deposit,
      dates,
      itemType: activeType,
      item: activeItem,
      details: activeType === 'car'
        ? `${nights} jour${nights > 1 ? 's' : ''}, ${(activeItem as Vehicle | null)?.transmission || 'Auto'}`
        : `${nights} nuit${nights > 1 ? 's' : ''}, 1 chambre, ${guests}`,
    }
  },

  createBooking: async (paymentType) => {
    const state = get()
    const item = state.itemType === 'car' ? state.car : state.room
    if (!item) return null

    set({ creating: true, createError: '' })
    try {
      const resourceType: BookingResourceType = state.itemType === 'car' ? 'VEHICLE' : 'ROOM'
      const booking = await createBookingApi({
        resourceType,
        resourceId: item.id,
        startDate: state.arrival,
        endDate: state.departure,
        paymentType,
      })
      set({ booking, creating: false })
      return booking
    } catch (error) {
      set({ createError: extractErrorMessage(error, 'Impossible de créer la réservation.'), creating: false })
      return null
    }
  },
    }),
    {
      name: 'booking-storage',
      // La réservation créée doit survivre à l'aller-retour vers CinetPay (redirection
      // externe puis retour sur /reservation/confirmation) : sans persistance, l'état
      // en mémoire est réinitialisé et la page de confirmation ne peut plus afficher
      // la vraie réservation.
      partialize: (state) => ({
        itemType: state.itemType,
        arrival: state.arrival,
        departure: state.departure,
        guests: state.guests,
        room: state.room,
        car: state.car,
        carOptions: state.carOptions,
        booking: state.booking,
      }),
    }
  )
)
