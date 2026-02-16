'use client'

import { useMemo } from 'react'

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
import { SalesReportPrintButton } from './print/SalesReportPrintButton'

// Lib
import {
  calculatePeriodDates,
  formatDateToISO,
  type PeriodType,
} from '@/lib/filter-utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function SalesReport({ searchParams }: SearchParamsType) {
  // Compute effective search params with default dates when none provided
  const effectiveSearchParams = useMemo(() => {
    if (searchParams?.startDate && searchParams?.endDate) {
      return searchParams
    }

    const period = (searchParams?.period || 'current_month') as PeriodType
    const dates = calculatePeriodDates(period)

    if (!dates) return searchParams

    return {
      ...searchParams,
      startDate: formatDateToISO(dates.startDate),
      endDate: formatDateToISO(dates.endDate),
    }
  }, [searchParams])

  return (
    <div className="space-y-5">
      <Topbar
        title="Relatório de vendas"
        primaryCta={<SalesReportPrintButton />}
      />
      {/* Filters */}
      <FiltersBar searchParams={searchParams} />

      {/* Summary Cards */}
      <SummaryCards searchParams={effectiveSearchParams} />

      {/* Sales Evolution Chart */}
      <SalesEvolutionChart searchParams={effectiveSearchParams} />

      {/* Charts Row: Approved/Rejected, Origin Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ApprovedRejectedChart searchParams={effectiveSearchParams} />
        <QuotationsOriginChart searchParams={effectiveSearchParams} />
        <OrdersOriginChart searchParams={effectiveSearchParams} />
      </div>

      {/* Rankings Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopProductsChart searchParams={effectiveSearchParams} />
        <TopClientsChart searchParams={effectiveSearchParams} />
      </div>

      {/* Table */}
      <SalesTable searchParams={effectiveSearchParams} />
    </div>
  )
}
