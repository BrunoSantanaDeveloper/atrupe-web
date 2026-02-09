'use client'

// Components
import { Topbar } from '@/components/common/Topbar'
import { FiltersBar } from './FiltersBar'
import { SummaryCards } from './SummaryCards'
import { CashFlowChart } from './CashFlowChart'
import { CashFlowTable } from './CashFlowTable'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function CashFlowReport({ searchParams }: SearchParamsType) {
  return (
    <div className="space-y-5">
      <Topbar title="Projeção de caixa" />

      {/* Filters */}
      <FiltersBar searchParams={searchParams} />

      {/* Summary Cards */}
      <SummaryCards searchParams={searchParams} />

      {/* Cash Flow Chart */}
      <CashFlowChart searchParams={searchParams} />

      {/* Table */}
      <CashFlowTable searchParams={searchParams} />
    </div>
  )
}
