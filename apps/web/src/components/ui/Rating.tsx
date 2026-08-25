import { Star, StarHalf } from 'lucide-react'

export default function Rating({ value = 4.5, showValue = true, className = '' }) {
  const full = Math.floor(value)
  const half = value - full >= 0.5
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: full }).map((_, i) => (
        <Star key={i} className="size-4 fill-primary text-primary" />
      ))}
      {half && <StarHalf className="size-4 fill-primary text-primary" />}
      {showValue && <span className="ml-1 text-sm font-semibold">{value.toLocaleString('fr-FR')}</span>}
    </span>
  )
}
