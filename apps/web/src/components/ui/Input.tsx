import { useState, forwardRef, InputHTMLAttributes, ElementType } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ElementType;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ icon: Icon, className = '', error, ...props }, ref) => {
  return (
    <div className={`relative flex flex-col gap-1 ${className}`}>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />}
        <input
          ref={ref}
          className={`w-full rounded-xl border ${error ? 'border-danger' : 'border-gray-300'} bg-white px-4 py-3 text-sm outline-none placeholder:text-gray-400 focus:border-secondary ${Icon ? 'pl-11' : ''}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-danger ml-1">{error}</span>}
    </div>
  )
})
Input.displayName = 'Input'
export default Input;

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(({ placeholder = 'Mot de passe', className = '', error, ...props }, ref) => {
  const [visible, setVisible] = useState(false)
  return (
    <div className={`relative flex flex-col gap-1 ${className}`}>
      <div className="relative">
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          className={`w-full rounded-xl border ${error ? 'border-danger' : 'border-gray-300'} bg-white px-4 py-3 pr-11 text-sm outline-none placeholder:text-gray-400 focus:border-secondary`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-ink"
          aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        >
          {visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </button>
      </div>
      {error && <span className="text-xs text-danger ml-1">{error}</span>}
    </div>
  )
})
PasswordInput.displayName = 'PasswordInput'
