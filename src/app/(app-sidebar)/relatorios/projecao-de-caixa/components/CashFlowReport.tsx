'use client'

// Components
import { Topbar } from '@/components/common/Topbar'
import { FiltersBar } from './FiltersBar'
import { SummaryCards } from './SummaryCards'
import { CashFlowChart } from './CashFlowChart'
import { CashFlowTable } from './CashFlowTable'

// Icons
import { IconPrinter } from '@tabler/icons-react'

// UI
import { Button } from '@/components/ui/button'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function CashFlowReport({ searchParams }: SearchParamsType) {
  return (
    <div className="space-y-5">
      <Topbar
        title="Projeção de caixa"
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
      <SummaryCards searchParams={searchParams} />

      {/* Cash Flow Chart */}
      <CashFlowChart searchParams={searchParams} />

      {/* Table */}
      <CashFlowTable searchParams={searchParams} />
    </div>
  )
}
