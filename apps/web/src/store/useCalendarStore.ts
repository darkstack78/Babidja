import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Structure de l'état calendrier :
// { [roomId]: { [dateStr]: { price?: number, status: 'a' | 'r' | 'b' } } }
// status: 'a' (disponible), 'r' (réservé), 'b' (bloqué manuellement)
//
// Démo locale pour le dashboard pro (Phase 2 : lecture/écriture réelle sur
// GET/PUT /tenant/:tenantId/availability, non encore branché côté backend).

export interface DayRate {
  price?: number
  status: 'a' | 'r' | 'b'
}

type RoomCalendar = Record<string, DayRate>
type Calendar = Record<string, RoomCalendar>

interface CalendarState {
  calendar: Calendar
  updateRate: (roomId: string, dateStr: string, data: Partial<DayRate>) => void
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
      calendar: {},
      updateRate: (roomId, dateStr, data) => set((state) => {
        const roomData = state.calendar[roomId] || {}
        const previousDay = roomData[dateStr] || { status: 'a' as const }
        return {
          calendar: {
            ...state.calendar,
            [roomId]: {
              ...roomData,
              [dateStr]: {
                ...previousDay,
                ...data,
              },
            },
          },
        }
      }),
    }),
    {
      name: 'calendar-storage',
    }
  )
)
