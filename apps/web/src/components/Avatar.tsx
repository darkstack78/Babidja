const palette = ['bg-primary', 'bg-secondary', 'bg-teal-600', 'bg-amber-600', 'bg-emerald-600']

export default function Avatar({ name = '', size = 'md', className = '' }: { name?: string, size?: 'sm' | 'md' | 'lg' | 'xl', className?: string }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const color = palette[(name.charCodeAt(0) || 0) % palette.length]
  const sizes = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-14 text-lg', xl: 'size-24 text-3xl' }
  return (
    <span className={`grid shrink-0 place-items-center rounded-full font-bold text-white ${color} ${sizes[size]} ${className}`}>
      {initials}
    </span>
  )
}
