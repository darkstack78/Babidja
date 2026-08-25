import { Check } from 'lucide-react'

export default function Toggle({ checked, onChange, className = '' }: { checked: boolean; onChange?: (checked: boolean) => void; className?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className={`relative h-7 w-14 rounded-full transition-colors ${checked ? 'bg-secondary' : 'bg-gray-300'} ${className}`}
    >
      <span
        className={`absolute top-0.5 grid size-6 place-items-center rounded-full bg-white shadow transition-all ${checked ? 'left-7' : 'left-0.5'}`}
      >
        {checked && <Check className="size-4 text-secondary" strokeWidth={3} />}
      </span>
    </button>
  )
}
