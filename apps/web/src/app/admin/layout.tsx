'use client';

import { House, Building2, ArrowLeftRight, Settings } from 'lucide-react'
import { DashboardShell } from '@/components/layout/DashboardShell'

const superAdminItems = [
  { href: '/admin', icon: House, label: 'Vue d’ensemble', exact: true },
  { href: '/admin/etablissements', icon: Building2, label: 'Établissements' },
  { href: '/admin/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { href: '/admin/parametres', icon: Settings, label: 'Paramètres globaux' },
]

import AuthGuard from '@/components/auth/AuthGuard'

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard redirectUrl="/auth/admin" allowedRoles={['SUPER_ADMIN']}>
      <DashboardShell 
        navItems={superAdminItems} 
        userTitle="Administrateur de la plateforme" 
        sidebarBg="bg-primary"
        sidebarText="text-green-50"
        activeClass="bg-white text-primary font-bold shadow-sm"
        hoverClass="hover:bg-primary-600 hover:text-white"
      >
        {children}
      </DashboardShell>
    </AuthGuard>
  )
}
