import VoituresClient from './VoituresClient'
import type { Vehicle } from '@/types/catalog'

function mapVehicle(dto: any): Vehicle {
  return {
    id: dto.id,
    name: `${dto.brand} ${dto.model}`,
    description: dto.description ?? '',
    price: Number(dto.pricePerDay),
    transmission: dto.transmission,
    kind: 'car',
    images: dto.images,
  };
}

async function fetchCarsSSR(): Promise<Vehicle[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    
    // fetch vehicles
    const vehiclesRes = await fetch(`${apiUrl}/vehicles`, { next: { revalidate: 60 } });
    if (!vehiclesRes.ok) return [];
    
    const vehiclesPage = await vehiclesRes.json();
    return ((vehiclesPage.data ?? []) as any[]).map(mapVehicle);
  } catch (error) {
    console.error("Failed to fetch cars for SSR", error);
    return [];
  }
}

export default async function CarsCatalogPage() {
  const cars = await fetchCarsSSR();
  return <VoituresClient initialCars={cars} />;
}
