import { Check } from 'lucide-react'
import { ReactNode } from 'react'

interface CheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label?: ReactNode;
  hint?: ReactNode;
  className?: string;
}

export default function Checkbox({ checked, onChange, label, hint, className = '' }: CheckboxProps) {
  return (
    <label className={`flex cursor-pointer items-center gap-2.5 text-sm ${className}`}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange?.(!checked)}
        className={`grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors ${
          checked ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
        }`}
      >
        {checked && <Check className="size-3.5 text-white" strokeWidth={3.5} />}
      </button>
      {label && <span className="flex-1">{label}</span>}
      {hint && <span className="font-semibold">{hint}</span>}
    </label>
  )
}
