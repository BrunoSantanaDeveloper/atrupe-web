'use client'

import { useMemo, useState } from 'react'

import { IconEye, IconEyeOff } from '@tabler/icons-react'

import { Card, CardContent } from '@/components/ui/card'
import { Heading } from '@/components/ui/typography'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FeatureGate } from '@/components/common/FeatureGate'
import { FEATURES } from '@/consts/features'
import { usePermissions } from '@/hooks/usePermissions'

import {
  DashboardValuesProvider,
  useDashboardValues,
} from './DashboardValuesContext'

import { DashboardQuotations } from './Quotations'
import { FollowUpToday } from './FollowUpToday'
import { FiscalOnboardingBanner } from './FiscalOnboardingBanner'
import { FinancialOverview } from './FinancialOverview'
import { SalesOverview } from './SalesOverview'
import { DashboardPeriod, DashboardPeriodFilter } from './DashboardPeriodFilter'
import { DashboardTopClients } from './TopClients'
import { DashboardSalesBySeller } from './SalesBySeller'
import { DashboardSalesEvolution } from './SalesEvolution'
import { ReleaseNotesBell } from '@/components/common/ReleaseNotes/ReleaseNotesBell'
import { ReleaseAnnouncement } from '@/components/common/ReleaseNotes/ReleaseAnnouncement'

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

function ToggleValuesButton() {
  const { showValues, canSeeValues, toggleValues } = useDashboardValues()

  // EC-24: sem a permissão "Valores" não há o que mostrar
  if (!canSeeValues) return null

  return (
    <TooltipProvider>
      <ActionButton
        tooltip={showValues ? 'Ocultar valores' : 'Mostrar valores'}
        size="iconMd"
        variant="neutralOutline"
        Icon={showValues ? IconEyeOff : IconEye}
        onClick={toggleValues}
      />
    </TooltipProvider>
  )
}

function DashboardContent() {
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
      <FiscalOnboardingBanner />
      {/* "O que mudou" na primeira abertura depois de uma atualização */}
      <ReleaseAnnouncement />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Heading as="h1">Painel</Heading>
        <div className="flex items-center gap-2">
          <DashboardPeriodFilter value={period} onChange={setPeriod} />
          <ToggleValuesButton />
          <ReleaseNotesBell />
        </div>
      </div>

      {!canSeeDashboard && (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="type-card-title mb-2">Acesso restrito</h3>
            <p className="text-gray-600">
              Você não tem permissão para visualizar informações gerais do
              painel.
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

      {/* O acompanhamento comercial do dia (CRM-3) */}
      {/* O acompanhamento comercial é do LITE (CRM-7, 29/10/2026) */}
      <FeatureGate features={[FEATURES.SALES.SALES_FOLLOW_UP]}>
        <PermissionGate permissions={['sale:quotation:view']}>
          <FollowUpToday />
        </PermissionGate>
      </FeatureGate>

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

export function Dashboard() {
  return (
    <DashboardValuesProvider>
      <DashboardContent />
    </DashboardValuesProvider>
  )
}
