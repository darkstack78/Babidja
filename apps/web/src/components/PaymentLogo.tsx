/** Logos des moyens de paiement recréés en SVG simplifié. */

function MTN({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className}>
      <ellipse cx="32" cy="20" rx="30" ry="17" fill="#FFCB05" stroke="#1F1F1F" strokeWidth="2" />
      <text x="32" y="26" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="800" fontSize="16" fill="#1F1F1F">
        MTN
      </text>
    </svg>
  )
}

function OrangeMoney({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className}>
      <path d="M14 30 L30 14 M30 14 L30 25 M30 14 L19 14" stroke="#1F1F1F" strokeWidth="6" strokeLinecap="square" fill="none" />
      <path d="M50 10 L36 24 M36 24 L36 14.5 M36 24 L45.5 24" stroke="#F2871E" strokeWidth="6" strokeLinecap="square" fill="none" />
    </svg>
  )
}

function Moov({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className}>
      <text x="30" y="20" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="800" fontStyle="italic" fontSize="15" fill="#0066B3">
        Moov
      </text>
      <text x="30" y="34" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="800" fontStyle="italic" fontSize="15" fill="#0066B3">
        Money
      </text>
      <circle cx="52" cy="28" r="5" fill="#F2871E" />
    </svg>
  )
}

function Wave({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className}>
      <rect x="10" y="2" width="44" height="36" rx="8" fill="#1DC8FF" />
      <ellipse cx="32" cy="22" rx="12" ry="14" fill="#1F1F1F" />
      <ellipse cx="32" cy="26" rx="7" ry="9" fill="#fff" />
      <circle cx="29" cy="16" r="1.6" fill="#fff" />
      <circle cx="35" cy="16" r="1.6" fill="#fff" />
      <path d="M30 20 L34 20 L32 23 Z" fill="#F2871E" />
    </svg>
  )
}

function Visa({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className}>
      <rect x="2" y="6" width="60" height="28" rx="5" fill="#1A1F71" />
      <text x="32" y="26" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="800" fontStyle="italic" fontSize="14" fill="#fff">
        VISA
      </text>
    </svg>
  )
}

function Mastercard({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className}>
      <circle cx="26" cy="20" r="13" fill="#EB001B" />
      <circle cx="40" cy="20" r="13" fill="#F79E1B" fillOpacity="0.9" />
    </svg>
  )
}

function Bank({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className}>
      <rect x="6" y="6" width="52" height="28" rx="6" fill="#1A7A4C" />
      <text x="32" y="25" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="800" fontSize="12" fill="#fff">
        CB
      </text>
    </svg>
  )
}

const logos: Record<string, React.FC<{ className?: string }>> = {
  mtn: MTN,
  orange: OrangeMoney,
  moov: Moov,
  wave: Wave,
  visa: Visa,
  mastercard: Mastercard,
  bank: Bank,
}

export default function PaymentLogo({ method, className = 'h-8 w-12' }: { method: string; className?: string }) {
  const Cmp = logos[method] ?? Bank
  return <Cmp className={className} />
}
