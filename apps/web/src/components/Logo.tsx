import Link from 'next/link'
import Image from 'next/image'

/**
 * Logo Babydja utilisant l'image.
 */
export default function Logo({ variant = 'public', to = '/', className = '' }) {
  return (
    <Link href={to} className={`inline-flex flex-col items-start ${className}`}>
      <Image
        src="/logo.jpeg"
        alt="Logo Babydja"
        width={1024}
        height={1024}
        className={variant === 'pro' ? 'h-8 w-auto sm:h-12' : 'h-14 w-auto object-contain sm:h-16 lg:h-20'}
      />
    </Link>
  )
}
