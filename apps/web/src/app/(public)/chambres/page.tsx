import ChambresClient from './ChambresClient'
import type { Room } from '@/types/catalog'
import type { PlaceholderKind } from '@/components/Placeholder'

const VALID_PLACEHOLDER_KINDS: PlaceholderKind[] = [
  'beach', 'hotel', 'room', 'pool', 'car', 'monument', 'hut', 'map',
];

function toPlaceholderKind(kind: string): PlaceholderKind {
  return (VALID_PLACEHOLDER_KINDS as string[]).includes(kind) ? (kind as PlaceholderKind) : 'room';
}

function mapRoom(dto: any): Room {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? '',
    price: Number(dto.basePrice),
    capacityAdults: dto.capacityAdults,
    capacityChildren: dto.capacityChildren,
    size: dto.sizeSqm ?? undefined,
    kind: toPlaceholderKind(dto.kind),
    amenities: dto.amenities,
    images: dto.images,
  };
}

async function fetchRoomsSSR(): Promise<Room[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    
    // fetch hotels
    const hotelsRes = await fetch(`${apiUrl}/hotels`, { next: { revalidate: 60 } });
    if (!hotelsRes.ok) return [];
    
    const hotelsPage = await hotelsRes.json();
    const firstHotel = hotelsPage.data?.[0];
    if (!firstHotel) return [];

    // fetch hotel details
    const hotelRes = await fetch(`${apiUrl}/hotels/${firstHotel.id}`, { next: { revalidate: 60 } });
    if (!hotelRes.ok) return [];
    
    const hotel = await hotelRes.json();
    return ((hotel.rooms ?? []) as any[]).map(mapRoom);
  } catch (error) {
    console.error("Failed to fetch rooms for SSR", error);
    return [];
  }
}

export default async function RoomsCatalogPage() {
  const rooms = await fetchRoomsSSR();
  return <ChambresClient initialRooms={rooms} />;
}
