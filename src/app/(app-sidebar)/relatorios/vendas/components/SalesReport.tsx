'use client'

// Components
import { FiltersBar } from './FiltersBar'
import { SummaryCards } from './SummaryCards'
import { Topbar } from '@/components/common/Topbar'
import { TopClientsChart } from './TopClientsChart'
import { TopProductsChart } from './TopProductsChart'
import { OrdersOriginChart } from './OrdersOriginChart'
import { SalesEvolutionChart } from './SalesEvolutionChart'
import { ApprovedRejectedChart } from './ApprovedRejectedChart'
import { QuotationsOriginChart } from './QuotationsOriginChart'
import { SalesTable } from './SalesTable'

// Icons
import { IconPrinter } from '@tabler/icons-react'

// UI
import { Button } from '@/components/ui/button'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function SalesReport({ searchParams }: SearchParamsType) {
  return (
    <div className="space-y-5">
      <Topbar
        title="Relatório de vendas"
        primaryCta={
          <Button
            variant="neutralOutline"
            size="iconMd"
            RightIcon={IconPrinter}
          />
        }
      />
      {/* Filters */}
      <FiltersBar searchParams={searchParams} />

      {/* Summary Cards */}
      <SummaryCards />

      {/* Sales Evolution Chart */}
      <SalesEvolutionChart />

      {/* Charts Row: Approved/Rejected, Origin Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ApprovedRejectedChart />
        <QuotationsOriginChart />
        <OrdersOriginChart />
      </div>

      {/* Rankings Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopProductsChart />
        <TopClientsChart />
      </div>

      {/* Table */}
      <SalesTable />
    </div>
  )
}
