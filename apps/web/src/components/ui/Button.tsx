import Link from 'next/link'
import { ReactNode, ButtonHTMLAttributes } from 'react'

const variants: Record<string, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'bg-secondary text-white hover:bg-secondary-dark',
  outline: 'border-2 border-secondary text-secondary hover:bg-pastel',
  outlineOrange: 'border-2 border-primary text-primary hover:bg-orange-50',
  danger: 'border border-danger text-danger hover:bg-red-50',
  ghost: 'text-secondary hover:bg-pastel',
}

const sizes: Record<string, string> = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3 text-base',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  href?: string;
  className?: string;
  children: ReactNode;
}

export default function Button({ variant = 'primary', size = 'md', href, className = '', children, ...props }: ButtonProps) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    )
  }
  return (
    <button type={props.type || 'button'} className={cls} {...props}>
      {children}
    </button>
  )
}
