'use client';

import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Settings2, ShieldCheck, Fuel } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchCars } from '@/lib/api/catalog'
import type { Vehicle } from '@/types/catalog'
import CarBookingSidebar from '@/components/car/CarBookingSidebar'
import Placeholder from '@/components/Placeholder'
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

export default function CarDetail() {
  const { id } = useParams()
  const { data: cars = [], isLoading } = useQuery({
    queryKey: ['cars'],
    queryFn: fetchCars,
  })

  if (isLoading) return <DetailSkeleton />

  const car = cars.find((c: Vehicle) => c.id === id) ?? cars[0]

  if (!car) return <div className="p-8 text-center">Voiture non trouvée.</div>

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 pb-28 sm:px-6">
      <BackButton href="/voitures" className="mb-4" />
      {/* Fil d'ariane */}
      <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-secondary">Accueil</Link>
        <span>›</span>
        <Link href="/voitures" className="hover:text-secondary">Location de voitures</Link>
        <span>›</span>
        <span className="font-medium text-ink">{car.name}</span>
      </nav>

      {/* Image principale */}
      <div className="relative h-64 overflow-hidden rounded-3xl shadow-sm sm:h-96">
        {car.images && car.images.length > 0 ? (
          <Image src={car.images[0]} alt={car.name} fill priority sizes="(min-width: 1024px) 64rem, 100vw" className="object-cover" />
        ) : (
          <Placeholder kind={car.kind || 'car'} className="h-full w-full" />
        )}
      </div>

      <div className="mt-8 flex flex-col items-start justify-between gap-8 md:flex-row">
        {/* Détails Principaux */}
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{car.name}</h1>
          
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-medium text-gray-600">
            <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1">
              <Settings2 className="size-4 text-primary" />
              {car.transmission}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1">
              <ShieldCheck className="size-4 text-primary" />
              Assurance incluse
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1">
              <Fuel className="size-4 text-primary" />
              Plein à rendre
            </span>
          </div>

          <section className="mt-8">
            <h2 className="text-xl font-bold text-gray-900">Description</h2>
            <p className="mt-3 leading-relaxed text-gray-600">
              {car.description}
            </p>
          </section>
        </div>

        <CarBookingSidebar car={car} />
      </div>
    </div>
  )
}
