import { MetadataRoute } from 'next';
import { hotelConfig } from '@/data/mock';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: hotelConfig.name,
    short_name: 'Babydja',
    description: hotelConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#f6f6f4',
    theme_color: '#F2871E',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
