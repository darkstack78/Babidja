import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

/**
 * Bouton retour universel.
 * - Si `to` ou `href` est fourni, navigue vers cette route.
 * - Sinon, revient à la page précédente dans l'historique.
 */
interface BackButtonProps {
  to?: string;
  href?: string;
  className?: string;
}

export default function BackButton({ to, href, className = '' }: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    const target = href || to;
    if (target) {
      router.push(target)
    } else {
      router.back()
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Retour"
      className={`group flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 transition-all hover:bg-gray-50 hover:shadow-md active:scale-95 ${className}`}
    >
      <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
      <span>Retour</span>
    </button>
  )
}
