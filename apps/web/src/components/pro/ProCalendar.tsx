'use client';

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Placeholder from '@/components/Placeholder'
import Toggle from '@/components/ui/Toggle'
import Button from '@/components/ui/Button'
import { useCatalogStore } from '@/store/useCatalogStore'
import { useCalendarStore } from '@/store/useCalendarStore'

const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

const cellStyle: Record<string, string> = {
  a: 'bg-secondary text-white',
  r: 'bg-danger text-white',
  b: 'bg-primary text-white',
}

export default function ProCalendar({ type = 'hotel' }: { type?: 'hotel' | 'car' }) {
  const isCar = type === 'car'
  const items = useCatalogStore(state => isCar ? state.cars : state.rooms)
  const { calendar, updateRate } = useCalendarStore()

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  
  const [selectedItemId, setSelectedItemId] = useState(items.length > 0 ? items[0].id : '')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [priceInput, setPriceInput] = useState('')

  useEffect(() => {
    // If the items list changes (e.g., from rooms to cars) and current selection is no longer valid
    if (items.length > 0 && !items.find((i: any) => i.id === selectedItemId)) {
      setSelectedItemId(items[0].id)
      setSelectedDate(null)
    }
  }, [items, selectedItemId])

  useEffect(() => {
    if (selectedDate && selectedItemId) {
      // Adjust timezone so ISOString produces correct local date string
      const localDate = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000))
      const dateStr = localDate.toISOString().split('T')[0]
      const itemCal = calendar[selectedItemId] || {}
      const dayData = itemCal[dateStr]
      const defaultPrice = items.find((i: any) => i.id === selectedItemId)?.price || 0
      setPriceInput(dayData?.price?.toString() || defaultPrice.toString())
    }
  }, [selectedDate, selectedItemId, calendar, items])

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    // 0 = Sunday, 1 = Monday. Let's convert to 0 = Monday, 6 = Sunday
    const d = new Date(year, month, 1).getDay()
    return d === 0 ? 6 : d - 1
  }

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const emptyCells = Array.from({ length: firstDay })
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const item = items.find((i: any) => i.id === selectedItemId)
  const itemCal = calendar[selectedItemId] || {}

  const getLocalDateStr = (d: Date) => {
    const localDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000))
    return localDate.toISOString().split('T')[0]
  }

  const handleSavePrice = () => {
    if (!selectedDate || !selectedItemId) return
    const dateStr = getLocalDateStr(selectedDate)
    updateRate(selectedItemId, dateStr, { price: Number(priceInput) })
  }

  const handleToggleBlock = (blocked: boolean) => {
    if (!selectedDate || !selectedItemId) return
    const dateStr = getLocalDateStr(selectedDate)
    const currentStatus = itemCal[dateStr]?.status || 'a'
    if (currentStatus === 'r') return // Prevent unblocking a reserved item
    updateRate(selectedItemId, dateStr, { status: blocked ? 'b' : 'a' })
  }

  const selectedDateStr = selectedDate ? getLocalDateStr(selectedDate) : null
  const selectedDayData = selectedDateStr ? itemCal[selectedDateStr] : null
  const currentStatus = selectedDayData?.status || 'a'
  const isBlocked = currentStatus === 'b'

  return (
    <div>
      <h1 className="text-xl font-bold">Disponibilité & Tarifs</h1>

      <div className="mt-4 grid gap-5 xl:grid-cols-[1fr_300px]">
        {/* Calendrier */}
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <select 
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium outline-none cursor-pointer"
            value={selectedItemId}
            onChange={(e) => {
              setSelectedItemId(e.target.value)
              setSelectedDate(null)
            }}
          >
            {items.map((i: any) => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>

          <div className="mt-4 flex items-center justify-between">
            <button onClick={handlePrevMonth} aria-label="Mois précédent" className="grid size-8 place-items-center rounded-lg hover:bg-gray-100">
              <ChevronLeft className="size-4" />
            </button>
            <p className="text-sm font-bold">{months[month]} {year}</p>
            <button onClick={handleNextMonth} aria-label="Mois suivant" className="grid size-8 place-items-center rounded-lg hover:bg-gray-100">
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1.5 text-center">
            {weekDays.map((d) => (
              <span key={d} className="text-xs font-semibold text-gray-500">{d}</span>
            ))}
            {emptyCells.map((_, i) => (
              <div key={`empty-${i}`} className="py-1.5" />
            ))}
            {days.map((day) => {
              const d = new Date(year, month, day)
              const dStr = getLocalDateStr(d)
              const dayData = itemCal[dStr] || { status: 'a', price: item?.price || 0 }
              const isSelected = selectedDateStr === dStr

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(d)}
                  className={`flex flex-col items-center rounded-lg py-1.5 text-xs font-semibold transition-transform hover:scale-105 ${cellStyle[dayData.status]} ${isSelected ? 'ring-2 ring-ink ring-offset-2' : ''}`}
                >
                  <span className="text-sm">{day}</span>
                  <span className="text-[10px] font-medium opacity-90">{(dayData.price ?? 0) / 1000}k FCFA</span>
                </button>
              )
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-secondary" /> disponible
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-danger" /> réservé
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-primary" /> bloqué manuellement
            </span>
          </div>
        </section>

        {/* Panneau latéral */}
        <aside className="rounded-2xl bg-white p-5 shadow-sm">
          {item?.images && item.images.length > 0 && item.images[0].trim() !== '' ? (
            <img src={item.images[0]} alt="" className="h-40 w-full rounded-xl object-cover" />
          ) : (
            <Placeholder kind={item?.kind || (isCar ? 'car' : 'room')} className="h-40 w-full rounded-xl" />
          )}
          
          {selectedDate ? (
            <>
              <p className="mt-4 text-sm">
                <span className="font-bold">Sélection :</span>
                <br />
                {selectedDate.getDate()} {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </p>
              
              <p className="mt-4 text-sm font-bold">Modifier le tarif</p>
              <div className="mt-2 flex gap-2">
                <input
                  type="number"
                  value={priceInput}
                  onChange={e => setPriceInput(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-secondary"
                />
                <Button size="sm" onClick={handleSavePrice}>OK</Button>
              </div>

              {currentStatus !== 'r' ? (
                <div className="mt-5 flex items-center justify-between text-sm font-bold">
                  Bloquer/Débloquer
                  <Toggle checked={isBlocked} onChange={handleToggleBlock} />
                </div>
              ) : (
                <p className="mt-5 text-sm text-danger font-bold">{isCar ? 'Véhicule réservé' : 'Chambre réservée'}</p>
              )}
            </>
          ) : (
            <p className="mt-4 text-sm text-gray-500">Sélectionnez une date pour modifier le tarif ou la disponibilité.</p>
          )}
        </aside>
      </div>
    </div>
  )
}
