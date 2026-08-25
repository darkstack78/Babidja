import { useRouter, usePathname } from 'next/navigation'
import { CalendarDays, Users, ArrowRight, BedDouble, CarFront } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useBookingStore } from '../store/useBookingStore'

const bookingSchema = z.object({
  arrival: z.string().min(1, "Requis"),
  departure: z.string().min(1, "Requis"),
  guests: z.string().min(1, "Requis"),
}).refine((data) => {
  return new Date(data.arrival) < new Date(data.departure)
}, {
  message: "Date invalide",
  path: ["departure"],
})

export default function BookingWidget({ className = '' }) {
  const router = useRouter()
  const pathname = usePathname()
  
  const { arrival, departure, guests, itemType, setSearchCriteria } = useBookingStore()
  
  // Si on est sur /voitures, on force l'onglet voiture, sinon hôtel par défaut.
  const isCarPage = pathname.includes('/voitures')
  const defaultTab = isCarPage ? 'car' : 'room'
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      arrival,
      departure,
      guests,
    }
  })

  const onSubmit = (data: any) => {
    setSearchCriteria(data.arrival, data.departure, data.guests, defaultTab)
    if (defaultTab === 'car') {
      router.push('/voitures')
    } else {
      router.push('/chambres')
    }
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-full p-1 self-start ml-4 sm:ml-0">
        <button
          type="button"
          onClick={() => router.push('/chambres')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
            defaultTab === 'room' ? 'bg-white text-secondary shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BedDouble className="size-4" /> Hébergements
        </button>
        <button
          type="button"
          onClick={() => router.push('/voitures')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
            defaultTab === 'car' ? 'bg-white text-secondary shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <CarFront className="size-4" /> Voitures
        </button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col sm:flex-row items-center gap-2 rounded-3xl sm:rounded-full bg-white p-2 shadow-xl relative"
      >
        <div className="flex w-full flex-1 items-center gap-3 px-4 py-2 sm:py-0">
        <CalendarDays className="size-5 shrink-0 text-primary" />
        <div className="flex flex-col flex-1 relative">
          <label htmlFor="arrival-date" className="text-xs font-bold uppercase text-gray-500">Arrivée</label>
          <input
            id="arrival-date"
            type="date"
            className="w-full bg-transparent text-sm font-medium outline-none"
            {...register('arrival')}
          />
          {errors.arrival && <span className="absolute -bottom-5 left-0 text-[10px] text-red-500 font-medium whitespace-nowrap">{errors.arrival.message as string}</span>}
        </div>
      </div>
      
      <div className="hidden h-8 w-px bg-gray-200 sm:block"></div>
      
      <div className="flex w-full flex-1 items-center gap-3 border-t border-gray-100 px-4 py-3 sm:border-0 sm:py-0">
        <CalendarDays className="size-5 shrink-0 text-primary" />
        <div className="flex flex-col flex-1 relative">
          <label htmlFor="departure-date" className="text-xs font-bold uppercase text-gray-500">Départ</label>
          <input
            id="departure-date"
            type="date"
            className="w-full bg-transparent text-sm font-medium outline-none"
            {...register('departure')}
          />
          {errors.departure && <span className="absolute -bottom-5 left-0 text-[10px] text-red-500 font-medium whitespace-nowrap">{errors.departure.message as string}</span>}
        </div>
      </div>

      {defaultTab === 'room' && (
        <>
          <div className="hidden h-8 w-px bg-gray-200 sm:block"></div>
          
          <div className="flex w-full flex-1 items-center gap-3 border-t border-gray-100 px-4 py-3 sm:border-0 sm:py-0">
            <Users className="size-5 shrink-0 text-primary" />
            <div className="flex flex-col flex-1 relative">
              <label htmlFor="guests-select" className="text-xs font-bold uppercase text-gray-500">Voyageurs</label>
              <select id="guests-select" className="w-full bg-transparent text-sm font-medium outline-none" {...register('guests')}>
                <option value="1 Adulte">1 Adulte</option>
                <option value="2 Adultes">2 Adultes</option>
                <option value="2 Adultes, 1 Enfant">2 Adultes, 1 Enfant</option>
                <option value="2 Adultes, 2 Enfants">2 Adultes, 2 Enfants</option>
              </select>
              {errors.guests && <span className="absolute -bottom-5 left-0 text-[10px] text-red-500 font-medium whitespace-nowrap">{errors.guests.message as string}</span>}
            </div>
          </div>
        </>
      )}

      <button
        type="submit"
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-6 py-3 font-bold text-white transition-colors hover:bg-secondary-dark sm:mt-0 sm:w-auto"
      >
        Rechercher <ArrowRight className="size-4" />
      </button>
      </form>
    </div>
  )
}
