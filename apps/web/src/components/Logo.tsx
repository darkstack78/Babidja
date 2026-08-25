import Link from 'next/link'

/**
 * Logo Babydja utilisant l'image.
 */
export default function Logo({ variant = 'public', baseline = true, to = '/', className = '' }) {
  return (
    <Link href={to} className={`inline-flex flex-col items-start ${className}`}>
      <img src="/logo.jpeg" alt="Logo Babydja" className={variant === 'pro' ? 'h-8 sm:h-12' : 'h-14 sm:h-16 lg:h-20 object-contain'} />
    </Link>
  )
}
