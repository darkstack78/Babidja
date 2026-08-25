import { CheckCircle2 } from 'lucide-react'

export default function RoomAmenities({ amenities }) {
  if (!amenities || amenities.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-gray-900">Équipements inclus</h2>
      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {amenities.map((amenity, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle2 className="size-5 text-secondary" />
            {amenity}
          </li>
        ))}
      </ul>
    </section>
  )
}
