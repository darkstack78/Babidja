import { TreePalm, Hotel, BedDouble, Car, Waves, Landmark, Home, MapPin } from 'lucide-react'

const kinds = {
  beach: { gradient: 'from-teal-400 via-cyan-300 to-amber-200', icon: TreePalm },
  hotel: { gradient: 'from-emerald-300 via-teal-300 to-cyan-400', icon: Hotel },
  room: { gradient: 'from-orange-200 via-amber-300 to-orange-400', icon: BedDouble },
  pool: { gradient: 'from-cyan-300 via-sky-300 to-teal-400', icon: Waves },
  car: { gradient: 'from-slate-300 via-slate-400 to-slate-500', icon: Car },
  monument: { gradient: 'from-amber-200 via-yellow-300 to-amber-400', icon: Landmark },
  hut: { gradient: 'from-amber-300 via-orange-300 to-amber-500', icon: Home },
  map: { gradient: 'from-pastel via-green-100 to-emerald-100', icon: MapPin },
}

/**
 * Visuel factice aux couleurs de la charte, en attendant les vraies photos.
 * Remplacer par <img> quand les assets seront disponibles.
 */
export type PlaceholderKind = keyof typeof kinds;

interface PlaceholderProps {
  kind?: PlaceholderKind;
  label?: string;
  className?: string;
  iconClassName?: string;
}

export default function Placeholder({ kind = 'beach', label, className = '', iconClassName = 'size-10' }: PlaceholderProps) {
  const { gradient, icon: Icon } = kinds[kind] ?? kinds.beach
  return (
    <div className={`relative grid place-items-center overflow-hidden bg-gradient-to-br ${gradient} ${className}`}>
      <Icon className={`text-white/80 ${iconClassName}`} aria-hidden="true" />
      {label && (
        <span className="absolute bottom-2 left-2 text-xs font-semibold text-white drop-shadow">{label}</span>
      )}
    </div>
  )
}
