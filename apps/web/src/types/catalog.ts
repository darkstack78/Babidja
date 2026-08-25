import type { PlaceholderKind } from '@/components/Placeholder';

export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  capacityAdults: number;
  capacityChildren: number;
  size?: number;
  kind: PlaceholderKind;
  amenities: string[];
  images?: string[];
}

export interface Vehicle {
  id: string;
  name: string;
  description: string;
  price: number;
  transmission: string;
  kind: 'car';
  images?: string[];
}
