import { Construction } from 'lucide-react'

/** Espace réservé pour une page pas encore implémentée (évite un 404 sur un lien de nav déjà présent). */
export default function ComingSoon({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-xl font-bold">{title}</h1>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white p-12 text-center shadow-sm">
        <Construction className="size-10 text-gray-300" />
        <p className="text-sm text-gray-500">Cette page est en cours de construction.</p>
      </div>
    </div>
  )
}
