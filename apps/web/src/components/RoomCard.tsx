import Link from 'next/link'
import Image from 'next/image'
import { Users, LayoutTemplate } from 'lucide-react'
import Placeholder from './Placeholder'
import { fcfa } from '../utils/formatters'
import type { Room } from '@/types/catalog'

/**
 * Carte de chambre (mono-établissement)
 * variant "featured" : nom superposé sur l'image, prix "Dès X FCFA" (accueil)
 * variant "catalog"  : nom sur bandeau sombre + infos de base + prix (catalogue)
 */
export default function RoomCard({ room, variant = 'featured' }: { room: Room; variant?: string }) {
  return (
    <Link
      href={`/chambre/${room.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:-translate-y-1 focus-visible:shadow-lg"
    >
      <div className="relative h-48 w-full overflow-hidden">
        {room.images && room.images.length > 0 ? (
          <Image src={room.images[0]} alt={room.name} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <Placeholder kind={room.kind} className="h-48 w-full" />
        )}
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-3 pt-12 text-lg font-bold text-white">
          {room.name}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-between p-4">
        {variant === 'catalog' && (
          <div className="mb-4 text-sm text-gray-600 line-clamp-2">
            {room.description}
          </div>
        )}
        
        <div className="mt-auto flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="size-4 text-primary" />
              {room.capacityAdults + (room.capacityChildren || 0)} max.
            </span>
            {room.size && (
              <span className="flex items-center gap-1">
                <LayoutTemplate className="size-4 text-primary" />
                {room.size} m²
              </span>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="text-xs text-gray-500 uppercase font-bold">Par nuit</span>
            <span className="text-lg font-extrabold text-primary">{fcfa(room.price)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
