import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import Button from '../ui/Button'
import { fcfa } from '../../utils/formatters'
import { useBookingStore } from '../../store/useBookingStore'
import { useAuthStore } from '../../store/useAuthStore'

export default function BookingSidebar({ room }) {
  const router = useRouter()
  const { setRoom, getDetails, arrival, departure, guests, setSearchCriteria } = useBookingStore()
  const { isAuthenticated, openDrawer } = useAuthStore()
  const [isConfiguring, setIsConfiguring] = useState(false)
  
  const [durationUnit, setDurationUnit] = useState('days')
  const [durationValue, setDurationValue] = useState('')

  const details = getDetails(room)

  // Met à jour la date de départ dans le store quand la durée ou l'arrivée change
  useEffect(() => {
    if (!durationValue || isNaN(durationValue)) return
    
    const days = durationUnit === 'weeks' ? parseInt(durationValue) * 7 : parseInt(durationValue)
    const startDate = new Date(arrival)
    const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000)
    
    setSearchCriteria(arrival, endDate.toISOString().split('T')[0], guests, 'room')
  }, [arrival, durationUnit, durationValue, guests, setSearchCriteria])

  const handleReserve = () => {
    if (!durationValue || parseInt(durationValue) <= 0) return
    setRoom(room)
    if (!isAuthenticated) {
      openDrawer('register', () => router.push('/reservation'))
    } else {
      router.push('/reservation')
    }
  }

  const FormContent = () => (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-col border-b border-gray-100 pb-3">
        <label className="font-semibold mb-2 text-gray-900">Arrivée</label>
        <input 
          type="date" 
          value={arrival}
          onChange={(e) => setSearchCriteria(e.target.value, departure, guests, 'room')}
          className="w-full bg-transparent outline-none text-gray-600 font-medium"
        />
      </div>
      
      <div className="flex flex-col border-b border-gray-100 pb-3">
        <label className="font-semibold mb-2 text-gray-900">Combien de temps voulez-vous y passer ?</label>
        <div className="flex gap-2 mb-3">
          <button 
            type="button"
            onClick={() => setDurationUnit('days')}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-colors ${durationUnit === 'days' ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Jours
          </button>
          <button 
            type="button"
            onClick={() => setDurationUnit('weeks')}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-colors ${durationUnit === 'weeks' ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Semaines
          </button>
        </div>
        <input 
          type="number" 
          min="1"
          value={durationValue}
          onChange={(e) => setDurationValue(e.target.value)}
          placeholder={`Nombre de ${durationUnit === 'days' ? 'jours' : 'semaines'}`}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-secondary"
        />
      </div>

      <div className="flex flex-col">
        <label className="font-semibold mb-2 text-gray-900">Voyageurs</label>
        <select 
          value={guests}
          onChange={(e) => setSearchCriteria(arrival, departure, e.target.value, 'room')}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-secondary"
        >
          <option value="1 Adulte">1 Adulte</option>
          <option value="2 Adultes">2 Adultes</option>
          <option value="2 Adultes, 1 Enfant">2 Adultes, 1 Enfant</option>
          <option value="2 Adultes, 2 Enfants">2 Adultes, 2 Enfants</option>
        </select>
      </div>
    </div>
  )

  const PriceDisplay = () => {
    if (!durationValue || parseInt(durationValue) <= 0) return null
    return (
      <div className="my-4 rounded-xl bg-pastel/30 p-4">
        <span className="text-sm text-gray-500 uppercase font-bold">Total pour {details.nights} nuit{details.nights > 1 ? 's' : ''}</span>
        <p className="text-3xl font-extrabold text-primary">{fcfa(details.subtotal)}</p>
      </div>
    )
  }

  return (
    <>
      {/* Encart de réservation (Desktop) */}
      <div className="hidden w-full shrink-0 flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-xl md:flex md:w-80">
        {!isConfiguring ? (
          <>
            <div className="mb-6">
              <span className="text-sm text-gray-500 uppercase font-bold">À partir de</span>
              <p className="text-3xl font-extrabold text-primary">
                {fcfa(room.price)}<span className="text-sm text-gray-500 font-medium"> / nuit</span>
              </p>
            </div>
            <Button onClick={() => setIsConfiguring(true)} className="w-full text-lg py-3">
              Réserver cette chambre
            </Button>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Votre séjour</h3>
              <button onClick={() => setIsConfiguring(false)} className="text-gray-400 hover:text-gray-600">
                <X className="size-5" />
              </button>
            </div>
            
            <FormContent />
            <PriceDisplay />
            
            <Button 
              onClick={handleReserve} 
              disabled={!durationValue || parseInt(durationValue) <= 0}
              className="mt-6 w-full text-lg py-3 disabled:opacity-50"
            >
              Continuer
            </Button>
          </>
        )}
      </div>

      {/* Barre de réservation sticky (Mobile) */}
      <div className="fixed inset-x-0 bottom-16 z-50 border-t border-gray-200 bg-white px-4 pt-3 pb-4 shadow-[0_-8px_20px_-4px_rgba(0,0,0,0.15)] md:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
             <span className="text-xs text-gray-500 uppercase font-bold">À partir de</span>
             <p className="text-xl font-extrabold text-primary">{fcfa(room.price)}<span className="text-xs text-gray-500 font-medium"> / nuit</span></p>
          </div>
          <Button onClick={() => setIsConfiguring(true)} className="px-8">
            Réserver
          </Button>
        </div>
      </div>

      {/* Mobile Drawer (Bottom Sheet) */}
      {isConfiguring && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsConfiguring(false)} />
          <div className="relative w-full max-h-[90vh] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            <button 
              onClick={() => setIsConfiguring(false)}
              className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-gray-100 text-gray-500"
            >
              <X className="size-5" />
            </button>
            <h3 className="mb-6 text-lg font-bold text-gray-900">Configurez votre séjour</h3>
            
            <FormContent />
            <PriceDisplay />

            <Button 
              onClick={handleReserve} 
              disabled={!durationValue || parseInt(durationValue) <= 0}
              className="mt-6 w-full text-lg py-3 disabled:opacity-50"
            >
              Continuer
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
