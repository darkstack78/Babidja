import { Gift, Smartphone } from 'lucide-react'
import Button from './ui/Button'

export default function ReferralBanner() {
  return (
    <section className="flex flex-col items-center gap-6 overflow-hidden rounded-3xl bg-pastel p-8 sm:flex-row sm:p-10">
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-secondary sm:text-3xl">Parrainez et gagnez !</h2>
        <p className="mt-2 max-w-md text-sm text-ink/80">
          Invitez vos amis et obtenez des réductions sur vos voyages.
        </p>
        <Button className="mt-5">Parrainer maintenant</Button>
      </div>
      {/* Illustration simplifiée : deux téléphones + cadeau */}
      <div className="relative flex items-end gap-3 pr-6" aria-hidden="true">
        <span className="grid size-20 place-items-center rounded-2xl bg-primary/90 shadow-lg">
          <Smartphone className="size-10 text-white" />
        </span>
        <span className="grid size-24 place-items-center rounded-2xl bg-secondary/90 shadow-lg">
          <Smartphone className="size-12 text-white" />
        </span>
        <span className="absolute -right-2 -top-4 grid size-14 rotate-12 place-items-center rounded-xl bg-primary shadow-md">
          <Gift className="size-8 text-white" />
        </span>
      </div>
    </section>
  )
}
