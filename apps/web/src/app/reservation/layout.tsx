'use client';
import { useRouter } from 'next/navigation'
import { ArrowLeft, Lock } from 'lucide-react'
import Logo from '@/components/Logo'
import { usePathname } from 'next/navigation'

export default function ReservationLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isPayment = pathname.includes('/paiement')

  return (
    <div className="grid min-h-screen place-items-center px-4 py-8">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-lg">
        <header className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Retour"
            className="group flex size-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all hover:bg-gray-200 active:scale-90"
          >
            <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          </button>
          <Logo baseline={false} />
          {isPayment ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-secondary">
              <Lock className="size-3" /> Sécurisé
            </div>
          ) : (
            <div className="w-9" />
          )}
        </header>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
