'use client';
import { useState } from 'react'
import Link from 'next/link'
import { BedDouble } from 'lucide-react'
import BookingWidget from '@/components/BookingWidget'
import RoomCard from '@/components/RoomCard'
import type { Room } from '@/types/catalog'

const CAPACITY_OPTIONS = ['Tous', '1 adulte', '2 adultes', '2 adultes + enfants']
const PRICE_OPTIONS = ['Tous les prix', 'Moins de 50 000', '50 000 – 100 000', 'Plus de 100 000']
const AMENITY_OPTIONS = ['Tous', 'Wi-Fi', 'Piscine', 'Climatisation', 'Mini-bar', 'Spa']

function FilterChip({
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

function matchesPrice(price: number, filter: string) {
  if (filter === 'Moins de 50 000') return price < 50000
  if (filter === '50 000 – 100 000') return price >= 50000 && price <= 100000
  if (filter === 'Plus de 100 000') return price > 100000
  return true
}

function matchesCapacity(room: Room, filter: string) {
  if (filter === '1 adulte') return room.capacityAdults >= 1
  if (filter === '2 adultes') return room.capacityAdults >= 2
  if (filter === '2 adultes + enfants') return room.capacityAdults >= 2 && room.capacityChildren > 0
  return true
}

function matchesAmenity(room: Room, filter: string) {
  if (filter === 'Tous') return true
  return room.amenities?.some((a) => a.toLowerCase().includes(filter.toLowerCase())) ?? true
}

export default function ChambresClient({ initialRooms }: { initialRooms: Room[] }) {
  const [capacity, setCapacity] = useState(CAPACITY_OPTIONS[0])
  const [price, setPrice] = useState(PRICE_OPTIONS[0])
  const [amenity, setAmenity] = useState(AMENITY_OPTIONS[0])

  const filtered = initialRooms.filter(
    (r) => matchesCapacity(r, capacity) && matchesPrice(r.price, price) && matchesAmenity(r, amenity)
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Fil d'ariane */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-secondary">Accueil</Link>
        <span className="mx-1.5">›</span>
        <span className="font-medium text-ink">Chambres & Suites</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Nos Chambres & Suites</h1>
        <p className="mt-2 text-lg text-gray-600 max-w-2xl">
          Découvrez nos espaces conçus pour votre confort. Chaque chambre offre une expérience unique avec des équipements haut de gamme.
        </p>
      </div>

      <div className="mb-8 w-full max-w-5xl rounded-3xl bg-gray-50 p-6">
        <BookingWidget className="shadow-none border border-gray-200" />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <FilterChip label="Capacité" options={CAPACITY_OPTIONS} value={capacity} onChange={setCapacity} />
        <FilterChip label="Prix" options={PRICE_OPTIONS} value={price} onChange={setPrice} />
        <FilterChip label="Équipements" options={AMENITY_OPTIONS} value={amenity} onChange={setAmenity} />
        <span className="ml-auto text-sm text-gray-500">
          {filtered.length} chambre{filtered.length > 1 ? 's' : ''} trouvée{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
          <BedDouble className="mx-auto size-10 text-gray-300" />
          <p className="mt-3 font-medium text-gray-700">Aucune chambre ne correspond aux filtres</p>
          <button
            onClick={() => { setCapacity(CAPACITY_OPTIONS[0]); setPrice(PRICE_OPTIONS[0]); setAmenity(AMENITY_OPTIONS[0]); }}
            className="mt-3 text-sm font-semibold text-[#e97c2a] hover:underline"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r: Room) => (
            <RoomCard key={r.id} room={r} variant="catalog" />
          ))}
        </div>
      )}
    </div>
  )
}
