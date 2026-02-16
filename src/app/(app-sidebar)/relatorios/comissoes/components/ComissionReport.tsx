'use client'

// Components
import { Topbar } from '@/components/common/Topbar'
import { FiltersBar } from './FiltersBar'
import { SummaryCards } from './SummaryCards'
import { CommissionTable } from './CommissionTable'
import { CommissionReportPrintButton } from './print/CommissionReportPrintButton'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function ComissionReport({ searchParams }: SearchParamsType) {
  return (
    <div className="space-y-4">
      <Topbar title="Comissões" primaryCta={<CommissionReportPrintButton />} />

      {/* Filters */}
      <FiltersBar searchParams={searchParams} />

      {/* Summary Cards */}
      <SummaryCards searchParams={searchParams} />

      {/* Table */}
      <CommissionTable searchParams={searchParams} />
    </div>
  )
}
