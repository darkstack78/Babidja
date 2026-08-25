import http from '../http';
import type { Room, Vehicle } from '@/types/catalog';
import type { PlaceholderKind } from '@/components/Placeholder';

const VALID_PLACEHOLDER_KINDS: PlaceholderKind[] = [
  'beach', 'hotel', 'room', 'pool', 'car', 'monument', 'hut', 'map',
];

// Room.kind est un champ texte libre côté backend (pas d'enum Prisma) : on ne
// fait confiance qu'aux valeurs connues du composant Placeholder, avec un repli
// sûr sur 'room' plutôt que de propager une valeur non gérée à l'affichage.
function toPlaceholderKind(kind: string): PlaceholderKind {
  return (VALID_PLACEHOLDER_KINDS as string[]).includes(kind) ? (kind as PlaceholderKind) : 'room';
}

interface RoomDto {
  id: string;
  name: string;
  description: string | null;
  basePrice: string;
  images: string[];
  amenities: string[];
  capacityAdults: number;
  capacityChildren: number;
  sizeSqm: number | null;
  kind: string;
}

interface VehicleDto {
  id: string;
  brand: string;
  model: string;
  description: string | null;
  pricePerDay: string;
  transmission: string;
  images: string[];
}

function mapRoom(dto: RoomDto): Room {
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

function mapVehicle(dto: VehicleDto): Vehicle {
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

// L'architecture backend est multi-tenant (plusieurs hôtels possibles), mais le
// MVP actuel n'expose qu'un seul établissement hôtelier et une seule agence de
// location : on prend le premier tenant de chaque type plutôt que d'ajouter un
// endpoint "toutes les chambres à plat" qui n'aurait de sens qu'à partir de
// plusieurs hôtels.
export const fetchRooms = async (): Promise<Room[]> => {
  const { data: hotelsPage } = await http.get('/hotels');
  const firstHotel = hotelsPage.data?.[0];
  if (!firstHotel) return [];
  const { data: hotel } = await http.get(`/hotels/${firstHotel.id}`);
  return ((hotel.rooms ?? []) as RoomDto[]).map(mapRoom);
};

export const fetchCars = async (): Promise<Vehicle[]> => {
  const { data: vehiclesPage } = await http.get('/vehicles');
  return ((vehiclesPage.data ?? []) as VehicleDto[]).map(mapVehicle);
};
