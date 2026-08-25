import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import Button from '../ui/Button'
import { fcfa } from '../../utils/formatters'
import { useBookingStore } from '../../store/useBookingStore'
import { useAuthStore } from '../../store/useAuthStore'

export default function CarBookingSidebar({ car }) {
  const router = useRouter()
  const { setCar, getDetails, arrival, departure, guests, setSearchCriteria, carOptions, setCarOptions } = useBookingStore()
  const { isAuthenticated, openDrawer } = useAuthStore()
  const [isConfiguring, setIsConfiguring] = useState(false)
  
  const [durationUnit, setDurationUnit] = useState('days')
  const [durationValue, setDurationValue] = useState('')

  const details = getDetails(car)

  useEffect(() => {
    if (!durationValue || isNaN(durationValue)) return
    
    const days = durationUnit === 'weeks' ? parseInt(durationValue) * 7 : parseInt(durationValue)
    const startDate = new Date(arrival)
    const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000)
    
    setSearchCriteria(arrival, endDate.toISOString().split('T')[0], guests, 'car')
  }, [arrival, durationUnit, durationValue, guests, setSearchCriteria])

  const handleReserve = () => {
    if (!durationValue || parseInt(durationValue) <= 0) return
    setCar(car)
    if (!isAuthenticated) {
      openDrawer('register', () => router.push('/reservation'))
    } else {
      router.push('/reservation')
    }
  }

  const formContent = (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-col border-b border-gray-100 pb-3">
        <label className="font-semibold mb-2 text-gray-900">Prise en charge</label>
        <input 
          type="date" 
          value={arrival}
          onChange={(e) => setSearchCriteria(e.target.value, departure, guests, 'car')}
          className="w-full bg-transparent outline-none text-gray-600 font-medium"
        />
      </div>
      
      <div className="flex flex-col">
        <label className="font-semibold mb-2 text-gray-900">Combien de temps prévoyez-vous la location ?</label>
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

      <div className="flex flex-col gap-3 border-t border-gray-100 pt-3">
        <label className="font-semibold text-gray-900">Options supplémentaires</label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={carOptions?.driver || false}
            onChange={(e) => setCarOptions({ ...carOptions, driver: e.target.checked })}
            className="w-5 h-5 rounded border-gray-300 text-secondary focus:ring-secondary"
          />
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">Avec chauffeur</span>
            <span className="text-xs text-gray-500">+15 000 FCFA / jour</span>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={carOptions?.insurance || false}
            onChange={(e) => setCarOptions({ ...carOptions, insurance: e.target.checked })}
            className="w-5 h-5 rounded border-gray-300 text-secondary focus:ring-secondary"
          />
          <div className="flex flex-col">
            <span className="font-medium text-gray-800">Assurance tous risques</span>
            <span className="text-xs text-gray-500">+5 000 FCFA / jour</span>
          </div>
        </label>
      </div>
    </div>
  )

  const priceDisplay = !durationValue || parseInt(durationValue) <= 0 ? null : (
    <div className="my-4 rounded-xl bg-pastel/30 p-4">
      <span className="text-sm text-gray-500 uppercase font-bold">Total pour {details.nights} jour{details.nights > 1 ? 's' : ''}</span>
      <p className="text-3xl font-extrabold text-primary">{fcfa(details.subtotal)}</p>
    </div>
  )

  return (
    <>
      {/* Encart de réservation (Desktop) */}
      <div className="hidden w-full shrink-0 flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-xl md:flex md:w-80">
        {!isConfiguring ? (
          <>
            <div className="mb-6">
              <span className="text-sm text-gray-500 uppercase font-bold">À partir de</span>
              <p className="text-3xl font-extrabold text-primary">
                {fcfa(car.price)}<span className="text-sm text-gray-500 font-medium"> / jour</span>
              </p>
            </div>
            <Button onClick={() => setIsConfiguring(true)} className="w-full text-lg py-3">
              Réserver cette voiture
            </Button>
            <p className="mt-3 text-center text-xs text-gray-500">
              Paiement sécurisé. Annulation possible.
            </p>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Votre location</h3>
              <button onClick={() => setIsConfiguring(false)} className="text-gray-400 hover:text-gray-600">
                <X className="size-5" />
              </button>
            </div>
            
            {formContent}
            {priceDisplay}
            
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
            <p className="text-xl font-extrabold text-primary">{fcfa(car.price)}<span className="text-xs text-gray-500 font-medium"> / jour</span></p>
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
            <h3 className="mb-6 text-lg font-bold text-gray-900">Configurez votre location</h3>
            
            {formContent}
            {priceDisplay}

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
