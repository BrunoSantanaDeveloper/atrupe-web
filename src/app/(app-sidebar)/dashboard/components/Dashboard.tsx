'use client'

import { useMemo, useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { PermissionGate } from '@/components/common/PermissionGate'
import { usePermissions } from '@/hooks/usePermissions'

import { DashboardQuotations } from './Quotations'
import { FiscalSetupModal } from './FiscalSetupModal'
import { FinancialOverview } from './FinancialOverview'
import { SalesOverview } from './SalesOverview'
import { DashboardPeriod, DashboardPeriodFilter } from './DashboardPeriodFilter'
import { DashboardTopClients } from './TopClients'
import { DashboardSalesBySeller } from './SalesBySeller'
import { DashboardSalesEvolution } from './SalesEvolution'

function formatDateToISO(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDashboardDateRange(period: DashboardPeriod) {
  const today = new Date()
  today.setHours(12, 0, 0, 0)

  if (period === 'last_30_days') {
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 30)
    return { startDate, endDate: today }
  }

  if (period === 'next_30_days') {
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + 30)
    return { startDate: today, endDate }
  }

  return {
    startDate: new Date(today.getFullYear(), today.getMonth(), 1),
    endDate: new Date(today.getFullYear(), today.getMonth() + 1, 0),
  }
}

export function Dashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>('current_month')
  const { hasAnyPermission } = usePermissions()

  const filters = useMemo(() => {
    const { startDate, endDate } = getDashboardDateRange(period)
    return {
      startDate: formatDateToISO(startDate),
      endDate: formatDateToISO(endDate),
    }
  }, [period])

  const canSeeDashboard = hasAnyPermission([
    'dashboard:financial:view',
    'dashboard:sales:view',
    'dashboard:quotations:view',
    'dashboard:rankings:view',
  ])

  return (
    <div className="space-y-4 mt-1 w-full">
      <FiscalSetupModal />

      <div className="flex items-center justify-end">
        <DashboardPeriodFilter value={period} onChange={setPeriod} />
      </div>

      {!canSeeDashboard && (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium mb-2">Acesso restrito</h3>
            <p className="text-gray-600">
              Voce nao tem permissao para visualizar informacoes gerais do
              dashboard.
            </p>
          </CardContent>
        </Card>
      )}

      <PermissionGate permissions={['dashboard:financial:view']}>
        <FinancialOverview filters={filters} />
      </PermissionGate>

      <PermissionGate permissions={['dashboard:sales:view']}>
        <SalesOverview filters={filters} />
      </PermissionGate>

      <PermissionGate permissions={['dashboard:quotations:view']}>
        <DashboardQuotations filters={filters} />
      </PermissionGate>

      <PermissionGate permissions={['dashboard:rankings:view']}>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <DashboardSalesEvolution filters={filters} />
          <DashboardSalesBySeller filters={filters} />
          <DashboardTopClients filters={filters} />
        </div>
      </PermissionGate>
    </div>
  )
}
