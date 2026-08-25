import Link from 'next/link'
import Image from 'next/image'
import { Settings2 } from 'lucide-react'
import Placeholder from './Placeholder'
import { fcfa } from '../utils/formatters'
import type { Vehicle } from '@/types/catalog'

export default function CarCard({ car, variant = 'catalog' }: { car: Vehicle; variant?: string }) {
  return (
    <Link
      href={`/voiture/${car.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:-translate-y-1 focus-visible:shadow-lg"
    >
      <div className="relative h-48 w-full overflow-hidden">
        {car.images && car.images.length > 0 ? (
          <Image src={car.images[0]} alt={car.name} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <Placeholder kind={car.kind || 'car'} className="h-48 w-full" />
        )}
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-3 pt-12 text-lg font-bold text-white">
          {car.name}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-between p-4">
        {variant === 'catalog' && (
          <div className="mb-4 text-sm text-gray-600 line-clamp-2">
            {car.description}
          </div>
        )}
        
        <div className="mt-auto flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-gray-500">
            <span className="flex items-center gap-1">
              <Settings2 className="size-4 text-primary" />
              {car.transmission}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="text-xs text-gray-500 uppercase font-bold">Par jour</span>
            <span className="text-lg font-extrabold text-primary">{fcfa(car.price)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
