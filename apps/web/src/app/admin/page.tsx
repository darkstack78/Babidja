'use client';

import { Network, Coins, Users, CircleHelp, type LucideIcon } from 'lucide-react'
import { adminKpis } from '@/data/mock'

const kpiColor: Record<string, string> = { primary: 'bg-primary', secondary: 'bg-secondary', danger: 'bg-danger' }
const kpiIcons: Record<string, LucideIcon> = { network: Network, coins: Coins, users: Users, help: CircleHelp }

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-xl font-bold">Paramètres techniques & d&apos;administration globale</h1>
      <p className="mt-2 text-sm text-gray-600">
        Espace réservé à l&apos;administrateur système pour la maintenance de la plateforme.
      </p>

      {/* KPIs */}
      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        {adminKpis.map((kpi, i) => {
          const Icon = kpiIcons[kpi.icon] || CircleHelp
          const color = i === 0 ? 'primary' : i === 1 ? 'secondary' : i === 2 ? 'primary' : 'danger'
          return (
            <div key={kpi.id} className={`flex items-center justify-between gap-3 rounded-2xl p-5 text-white ${kpiColor[color]}`}>
              <div>
                <p className="text-xs font-medium text-white/90">{kpi.label}</p>
                <p className="mt-1 text-2xl font-extrabold">{kpi.value}</p>
              </div>
              <Icon className="size-9 shrink-0 text-white/70" />
            </div>
          )
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-8 text-center text-gray-500 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800">Aucune alerte technique</h2>
        <p className="mt-2">Le système est stable. Les sauvegardes sont à jour.</p>
      </div>
    </div>
  )
}
