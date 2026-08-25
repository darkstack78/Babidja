'use client';

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Users, LayoutTemplate } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchRooms } from '@/lib/api/catalog'
import type { Room } from '@/types/catalog'
import RoomGallery from '@/components/room/RoomGallery'
import RoomAmenities from '@/components/room/RoomAmenities'
import BookingSidebar from '@/components/room/BookingSidebar'
import BackButton from '@/components/ui/BackButton'

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-4 py-6 sm:px-6">
      <div className="mb-4 h-4 w-48 rounded bg-gray-200" />
      <div className="h-64 rounded-3xl bg-gray-200 sm:h-96" />
      <div className="mt-8 h-8 w-2/3 rounded bg-gray-200" />
      <div className="mt-4 flex gap-3">
        <div className="h-7 w-28 rounded-full bg-gray-100" />
        <div className="h-7 w-28 rounded-full bg-gray-100" />
      </div>
      <div className="mt-8 space-y-2">
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-4 w-5/6 rounded bg-gray-100" />
        <div className="h-4 w-2/3 rounded bg-gray-100" />
      </div>
    </div>
  )
}

export default function RoomDetail() {
  const { id } = useParams()
  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms,
  })

  if (isLoading) return <DetailSkeleton />

  const room = rooms.find((r: Room) => r.id === id) ?? rooms[0]

  if (!room) return <div className="p-8 text-center">Chambre non trouvée.</div>

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 pb-40 sm:px-6">
      <BackButton href="/chambres" className="mb-4" />
      {/* Fil d'ariane */}
      <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-secondary">Accueil</Link>
        <span>›</span>
        <Link href="/chambres" className="hover:text-secondary">Chambres & Suites</Link>
        <span>›</span>
        <span className="font-medium text-ink">{room.name}</span>
      </nav>

      {/* Galerie de la chambre */}
      <RoomGallery room={room} />

      <div className="mt-8 flex flex-col items-start justify-between gap-8 md:flex-row">
        {/* Détails Principaux */}
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{room.name}</h1>
          
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-medium text-gray-600">
            <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1">
              <Users className="size-4 text-primary" />
              {room.capacityAdults} Adultes, {room.capacityChildren} Enfant(s) max.
            </span>
            {room.size && (
              <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1">
                <LayoutTemplate className="size-4 text-primary" />
                {room.size} m²
              </span>
            )}
          </div>

          <section className="mt-8">
            <h2 className="text-xl font-bold text-gray-900">Description</h2>
            <p className="mt-3 leading-relaxed text-gray-600">
              {room.description}
            </p>
          </section>

          <RoomAmenities amenities={room.amenities} />
        </div>

        <BookingSidebar room={room} />
      </div>
    </div>
  )
}
