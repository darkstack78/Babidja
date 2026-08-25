'use client';
import { useState } from 'react'
import Link from 'next/link'
import { CarFront } from 'lucide-react'
import BookingWidget from '@/components/BookingWidget'
import CarCard from '@/components/CarCard'
import type { Vehicle } from '@/types/catalog'

const CATEGORY_OPTIONS = ['Toutes', 'SUV', 'Berline', 'Citadine', '4x4']
const TRANSMISSION_OPTIONS = ['Toutes', 'Automatique', 'Manuelle']
const PRICE_OPTIONS = ['Tous les prix', 'Moins de 30 000', '30 000 – 60 000', 'Plus de 60 000']

function FilterSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-medium focus:border-secondary focus:outline-none cursor-pointer hover:border-secondary transition-colors"
    >
      {options.map((o) => (
        <option key={o} value={o}>{o === options[0] ? `${label} : ${o}` : o}</option>
      ))}
    </select>
  )
}

function matchesCategory(car: Vehicle, filter: string) {
  if (filter === 'Toutes') return true
  const name = car.name.toLowerCase()
  if (filter === 'SUV') return name.includes('suv') || name.includes('3008')
  if (filter === 'Berline') return name.includes('berline') || name.includes('corolla')
  if (filter === 'Citadine') return name.includes('clio') || name.includes('citadine')
  if (filter === '4x4') return name.includes('prado') || name.includes('4x4') || name.includes('land')
  return true
}

function matchesTransmission(car: Vehicle, filter: string) {
  if (filter === 'Toutes') return true
  return car.transmission?.toLowerCase() === filter.toLowerCase()
}

function matchesPrice(price: number, filter: string) {
  if (filter === 'Moins de 30 000') return price < 30000
  if (filter === '30 000 – 60 000') return price >= 30000 && price <= 60000
  if (filter === 'Plus de 60 000') return price > 60000
  return true
}

export default function VoituresClient({ initialCars }: { initialCars: Vehicle[] }) {
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0])
  const [transmission, setTransmission] = useState(TRANSMISSION_OPTIONS[0])
  const [price, setPrice] = useState(PRICE_OPTIONS[0])

  const filtered = initialCars.filter(
    (c) => matchesCategory(c, category) && matchesTransmission(c, transmission) && matchesPrice(c.price, price)
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Fil d'ariane */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-secondary">Accueil</Link>
        <span className="mx-1.5">›</span>
        <span className="font-medium text-ink">Location de voitures</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Nos Voitures en Location</h1>
        <p className="mt-2 text-lg text-gray-600 max-w-2xl">
          Découvrez notre flotte de véhicules conçue pour vos déplacements. De la citadine au 4x4, louez le véhicule parfait pour votre séjour.
        </p>
      </div>

      <div className="mb-8 w-full max-w-5xl rounded-3xl bg-gray-50 p-6">
        <BookingWidget className="shadow-none border border-gray-200" />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <FilterSelect label="Catégorie" options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />
        <FilterSelect label="Transmission" options={TRANSMISSION_OPTIONS} value={transmission} onChange={setTransmission} />
        <FilterSelect label="Prix max" options={PRICE_OPTIONS} value={price} onChange={setPrice} />
        <span className="ml-auto text-sm text-gray-500">
          {filtered.length} véhicule{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
          <CarFront className="mx-auto size-10 text-gray-300" />
          <p className="mt-3 font-medium text-gray-700">Aucun véhicule ne correspond aux filtres</p>
          <button
            onClick={() => { setCategory(CATEGORY_OPTIONS[0]); setTransmission(TRANSMISSION_OPTIONS[0]); setPrice(PRICE_OPTIONS[0]); }}
            className="mt-3 text-sm font-semibold text-[#e97c2a] hover:underline"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c: Vehicle) => (
            <CarCard key={c.id} car={c} variant="catalog" />
          ))}
        </div>
      )}
    </div>
  )
}
