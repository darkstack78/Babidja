'use client';

import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, Edit, Plus, BedDouble, Car } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import http from '@/lib/http'
import { fcfa } from '@/utils/formatters'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

interface CatalogueItem {
  id: string;
  name: string;
  type: 'ROOM' | 'VEHICLE';
  price: number;
  isActive: boolean;
}

export default function AdminCatalogue() {
  const { user } = useAuthStore()
  const [items, setItems] = useState<CatalogueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.tenantId) return
    http.get(`/tenant/${user.tenantId}/catalogue`)
      .then(res => setItems(res.data))
      .catch(() => setError("Impossible de charger le catalogue."))
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Catalogue</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez vos chambres, suites et véhicules.</p>
        </div>
        <Button>
          <Plus className="size-4" /> Ajouter un élément
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 border border-dashed border-gray-200 rounded-2xl">
            Aucun élément dans votre catalogue.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-2xl bg-white p-5 shadow-sm border border-gray-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={item.type === 'ROOM' ? 'default' : 'secondary'}>
                    {item.type === 'ROOM' ? 'Chambre' : 'Véhicule'}
                  </Badge>
                  <Badge variant={item.isActive ? 'success' : 'warning'}>
                    {item.isActive ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  {item.type === 'ROOM' ? <BedDouble className="size-5 text-gray-400" /> : <Car className="size-5 text-gray-400" />}
                  {item.name}
                </h3>
                <p className="text-[#e97c2a] font-extrabold text-xl mt-2">{fcfa(item.price)} <span className="text-sm font-medium text-gray-500">/ jour</span></p>
              </div>
              <div className="mt-5">
                <Button variant="outline" className="w-full">
                  <Edit className="size-4" /> Modifier
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
