'use client'

// Components
import { SalesTable } from './SalesTable'
import { FiltersBar } from './FiltersBar'
import { SummaryCards } from './SummaryCards'
import { Topbar } from '@/components/common/Topbar'
import { TopClientsChart } from './TopClientsChart'
import { TopProductsChart } from './TopProductsChart'
import { OrdersOriginChart } from './OrdersOriginChart'
import { SalesEvolutionChart } from './SalesEvolutionChart'
import { ApprovedRejectedChart } from './ApprovedRejectedChart'
import { QuotationsOriginChart } from './QuotationsOriginChart'
import { SalesReportPrintButton } from './SalesReportPrintButton'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function SalesReport({ searchParams }: SearchParamsType) {
  return (
    <div className="space-y-5">
      <Topbar
        title="Relatório de vendas"
        primaryCta={<SalesReportPrintButton />}
      />
      {/* Filters */}
      <FiltersBar searchParams={searchParams} />

      {/* Summary Cards */}
      <SummaryCards searchParams={searchParams} />

      {/* Sales Evolution Chart */}
      <SalesEvolutionChart searchParams={searchParams} />

      {/* Charts Row: Approved/Rejected, Origin Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ApprovedRejectedChart searchParams={searchParams} />
        <QuotationsOriginChart searchParams={searchParams} />
        <OrdersOriginChart searchParams={searchParams} />
      </div>

      {/* Rankings Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopProductsChart searchParams={searchParams} />
        <TopClientsChart searchParams={searchParams} />
      </div>

      {/* Table */}
      <SalesTable searchParams={searchParams} />
    </div>
  )
}
