'use client';

import { BedDouble, Percent, Coins, CircleHelp, Car, type LucideIcon } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { hotelKpis, hotelChart, hotelReservations, hotelConfig, carKpis, carChart, carReservations, carConfig } from '@/data/mock'
import { fcfa } from '@/utils/formatters'

const kpiStyle: Record<string, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  danger: 'bg-danger',
}
const kpiIcon: Record<string, LucideIcon> = { bed: BedDouble, percent: Percent, coins: Coins, help: CircleHelp, car: Car }

export default function ProDashboard({ type = 'hotel' }: { type?: 'hotel' | 'car' }) {
  const isCar = type === 'car'
  const config = isCar ? carConfig : hotelConfig
  const kpis = isCar ? carKpis : hotelKpis
  const chartData = isCar ? carChart : hotelChart
  const reservations = isCar ? carReservations : hotelReservations

  return (
    <div>
      <h1 className="text-xl font-bold">Tableau de bord — {config.name}</h1>

      {/* KPIs */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, i) => {
          const Icon = kpiIcon[kpi.icon] || CircleHelp
          const color = i === 0 ? 'primary' : i === 1 ? 'secondary' : i === 2 ? 'primary' : 'danger'
          return (
            <div key={kpi.id} className={`flex items-center justify-between gap-3 rounded-2xl p-5 text-white ${kpiStyle[color]}`}>
              <div>
                <p className="text-xs font-medium text-white/90">{kpi.label}</p>
                <p className="mt-1 text-2xl font-extrabold">{kpi.value}</p>
              </div>
              <Icon className="size-9 shrink-0 text-white/70" />
            </div>
          )
        })}
      </div>

      {/* Évolution des réservations */}
      <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-bold">Évolution des réservations (30 jours)</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="reservations" name="Réservations" stroke="#F2871E" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="revenus" name="Revenus" stroke="#1A7A4C" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Dernières réservations */}
      <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-bold">Dernières réservations</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-md text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="py-2 font-semibold">Client</th>
                <th className="py-2 font-semibold">Service réservé</th>
                <th className="py-2 font-semibold">Montant</th>
                <th className="py-2 font-semibold">Date d’ajout</th>
              </tr>
            </thead>
            <tbody>
              {reservations.slice(0, 4).map((r) => (
                <tr key={r.id} className="border-b border-gray-50">
                  <td className="py-2.5 font-medium">{r.client}</td>
                  <td className="py-2.5">{r.service}</td>
                  <td className="py-2.5 font-semibold">{fcfa(r.amount)}</td>
                  <td className="py-2.5 text-gray-500">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
