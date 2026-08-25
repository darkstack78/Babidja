import { ReactNode } from 'react'

const variants: Record<string, string> = {
  success: 'bg-secondary text-white',
  successSoft: 'bg-pastel text-secondary',
  warning: 'bg-primary text-white',
  warningSoft: 'bg-orange-100 text-primary-dark',
  danger: 'bg-danger text-white',
  dangerSoft: 'bg-red-100 text-danger',
  neutral: 'bg-gray-400 text-white',
  neutralSoft: 'bg-gray-200 text-gray-600',
  dark: 'bg-ink text-white',
}

export default function Badge({ variant = 'success', className = '', children }: { variant?: string; className?: string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
