'use client';
import { useState } from 'react'
import Link from 'next/link'
import { BedDouble, Car, ChevronRight, Star, MapPin, MessageCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import RoomCard from '@/components/RoomCard'
import CarCard from '@/components/CarCard'
import { fetchRooms, fetchCars } from '@/lib/api/catalog'
import { hotelConfig } from '@/data/mock'
import BookingWidget from '@/components/BookingWidget'
import CardSkeleton from '@/components/ui/CardSkeleton'
import type { Room, Vehicle } from '@/types/catalog'
import http from '@/lib/http'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user?: { firstName: string; lastName: string }
}

async function fetchReviews(): Promise<Review[]> {
  try {
    const { data: hotelsPage } = await http.get('/hotels')
    const firstHotel = hotelsPage.data?.[0]
    if (!firstHotel) return []
    const { data } = await http.get(`/hotels/${firstHotel.id}/reviews`)
    return Array.isArray(data) ? data : data.data ?? []
  } catch {
    return []
  }
}

function SectionHeader({ title, to }: { title: string, to: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
      {to && (
        <Link href={to} className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          Voir tout <ChevronRight className="size-4" />
        </Link>
      )}
    </div>
  )
}

export default function Home() {
  const { data: rooms = [], isLoading: roomsLoading, isError: roomsError } = useQuery<Room[]>({
    queryKey: ['rooms'],
    queryFn: fetchRooms,
    staleTime: 5 * 60 * 1000,
  })

  const { data: cars = [], isLoading: carsLoading, isError: carsError } = useQuery<Vehicle[]>({
    queryKey: ['cars'],
    queryFn: fetchCars,
    staleTime: 5 * 60 * 1000,
  })

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ['reviews-home'],
    queryFn: fetchReviews,
    staleTime: 10 * 60 * 1000,
  })

  const [mapsError, setMapsError] = useState(false)

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
      {/* Bannière hero */}
      <section className="relative mt-4 flex min-h-[50vh] sm:min-h-[400px] flex-col justify-center overflow-hidden rounded-3xl bg-[url('/image_banniere_de_recherche.png')] bg-cover bg-center px-6 py-16 sm:px-12 sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-black/20"></div>
        <div className="relative z-10">
          <h1 className="max-w-xl text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            Bienvenue à {hotelConfig.name}
          </h1>
          <p className="mt-4 max-w-lg text-lg font-medium text-white">
            {hotelConfig.description}
          </p>
          <div className="mt-8">
            <BookingWidget />
          </div>
        </div>
      </section>

      {/* Raccourcis services */}
      <section className="mt-12 flex flex-wrap items-start justify-center gap-8 sm:gap-16">
        <Link href="/chambres" className="group flex flex-col items-center gap-3 text-sm font-bold text-gray-700" aria-label="Voir les chambres et suites">
          <span className="grid size-20 place-items-center rounded-2xl bg-secondary text-white shadow-md transition-transform group-hover:scale-105">
            <BedDouble className="size-9" />
          </span>
          Chambres &amp; Suites
        </Link>
        <Link href="/voitures" className="group flex flex-col items-center gap-3 text-sm font-bold text-gray-700" aria-label="Voir les voitures en location">
          <span className="grid size-20 place-items-center rounded-2xl bg-primary text-white shadow-md transition-transform group-hover:scale-105">
            <Car className="size-9" />
          </span>
          Location Voitures
        </Link>
      </section>

      {/* Nos Chambres & Suites */}
      <section className="mt-16">
        <SectionHeader title="Nos Chambres &amp; Suites" to="/chambres" />
        {roomsError ? (
          <p className="text-sm text-red-500 py-4">Impossible de charger les chambres. Veuillez réessayer.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {roomsLoading
              ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
              : rooms.slice(0, 4).map((r) => <RoomCard key={r.id} room={r} />)
            }
          </div>
        )}
      </section>

      {/* Nos Voitures */}
      <section className="mt-16">
        <SectionHeader title="Nos Voitures en Location" to="/voitures" />
        {carsError ? (
          <p className="text-sm text-red-500 py-4">Impossible de charger les voitures. Veuillez réessayer.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {carsLoading
              ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
              : cars.slice(0, 4).map((c) => <CarCard key={c.id} car={c} />)
            }
          </div>
        )}
      </section>

      {/* Présentation rapide */}
      <section className="mt-16 rounded-3xl bg-gray-50 p-8 sm:p-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-2xl font-bold sm:text-3xl">Pourquoi choisir {hotelConfig.name} ?</h2>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {hotelConfig.amenities.map((amenity, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="grid size-12 place-items-center rounded-full bg-white text-primary shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </span>
                <span className="text-sm font-medium">{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Localisation */}
      <section className="mt-16">
        <SectionHeader title="Notre Localisation" to="" />
        <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center gap-3 text-gray-700">
            <span className="grid size-10 place-items-center rounded-xl bg-gray-100 text-primary">
              <MapPin className="size-5" />
            </span>
            <div>
              <p className="font-bold text-gray-900">{hotelConfig.name}</p>
              <p className="text-sm">{hotelConfig.address}</p>
            </div>
          </div>
          {mapsError ? (
            <div className="mt-6 flex h-80 w-full items-center justify-center rounded-2xl bg-gray-100">
              <div className="text-center">
                <MapPin className="mx-auto size-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Carte non disponible.</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotelConfig.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-semibold text-[#e97c2a] hover:underline"
                >
                  Ouvrir dans Google Maps →
                </a>
              </div>
            </div>
          ) : (
            <iframe
              className="mt-6 h-80 w-full overflow-hidden rounded-2xl"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(hotelConfig.address)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              onError={() => setMapsError(true)}
              title="Localisation de l'hôtel"
            />
          )}
        </div>
      </section>

      {/* Section Avis Clients */}
      <section className="mt-16 border-t border-gray-100 pt-16">
        <SectionHeader title="Ce que disent nos clients" to="" />
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-gray-400">
            <MessageCircle className="size-12 text-gray-200" />
            <p className="text-sm font-medium">Aucun avis pour le moment.</p>
            <p className="text-xs text-gray-300">Soyez le premier à laisser un avis après votre séjour !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {reviews.slice(0, 3).map((review) => {
              const name = review.user
                ? [review.user.firstName, review.user.lastName].filter(Boolean).join(' ') || 'Client'
                : 'Client vérifié'
              const date = new Date(review.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric',
              })
              return (
                <div key={review.id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-full bg-pastel text-primary font-bold">
                      {name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{name}</p>
                      <p className="text-xs text-gray-500">{date}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`size-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
                    ))}
                  </div>
                  {review.comment && (
                    <p className="mt-3 text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
