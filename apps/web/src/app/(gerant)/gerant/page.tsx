'use client';

import { useState, useEffect } from 'react'
import { CalendarDays, Wallet, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import http from '@/lib/http'
import { fcfa } from '@/utils/formatters'

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  revenue: number;
}

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.tenantId) return
    http.get(`/tenant/${user.tenantId}/dashboard`)
      .then(res => setStats(res.data))
      .catch(() => setError("Impossible de charger les statistiques."))
      .finally(() => setLoading(false))
  }, [user?.tenantId])

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#e97c2a]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 text-red-600 flex items-center gap-3">
        <AlertCircle className="size-6 shrink-0" />
        <p className="font-semibold">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">Tableau de bord</h1>
      <p className="text-gray-500">Bienvenue dans votre espace gérant. Voici le résumé de votre activité.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon={CalendarDays} 
          title="Réservations totales" 
          value={stats?.totalBookings ?? 0} 
          color="bg-blue-50 text-blue-600" 
        />
        <StatCard 
          icon={Clock} 
          title="En attente" 
          value={stats?.pendingBookings ?? 0} 
          color="bg-orange-50 text-[#e97c2a]" 
        />
        <StatCard 
          icon={CheckCircle} 
          title="Confirmées" 
          value={stats?.confirmedBookings ?? 0} 
          color="bg-green-50 text-green-600" 
        />
        <StatCard 
          icon={Wallet} 
          title="Chiffre d'affaires" 
          value={fcfa(stats?.revenue ?? 0)} 
          color="bg-purple-50 text-purple-600" 
        />
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, title, value, color }: { icon: any, title: string, value: string | number, color: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`grid size-12 place-items-center rounded-xl ${color}`}>
        <Icon className="size-6" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-500">{title}</p>
        <p className="text-xl font-extrabold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  )
}
