'use client';
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import BookingWidget from '@/components/BookingWidget'
import RoomCard from '@/components/RoomCard'
import { fetchRooms } from '@/lib/api/catalog'
import type { Room } from '@/types/catalog'

function FilterChip({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3.5 py-1.5 text-sm hover:border-secondary">
      {label}
      <ChevronDown className="size-3.5" />
    </button>
  )
}

export default function RoomsCatalog() {
  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms,
  })
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

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip label="Capacité" />
        <FilterChip label="Prix" />
        <FilterChip label="Équipements" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((r: Room) => (
          <RoomCard key={r.id} room={r} variant="catalog" />
        ))}
      </div>
    </div>
  )
}
