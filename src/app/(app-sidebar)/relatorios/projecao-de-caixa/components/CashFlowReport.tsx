// Components
import { Topbar } from '@/components/common/Topbar'
import { FiltersBar } from './FiltersBar'
import { SummaryCards } from './SummaryCards'
import { CashFlowChart } from './CashFlowChart'
import { CashFlowTable } from './CashFlowTable'
import { CashFlowReportPrintButton } from './print/CashFlowReportPrintButton'

// Utils
import {
  calculatePeriodDates,
  formatDateToISO,
  type PeriodType,
} from '@/lib/filter-utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function CashFlowReport({ searchParams }: SearchParamsType) {
  // Compute default dates from selected period when not present in URL
  let effectiveParams = searchParams
  if (!searchParams?.startDate || !searchParams?.endDate) {
    const period = (searchParams?.period as PeriodType) || 'next_7_days'
    const dates = calculatePeriodDates(period)
    if (dates) {
      effectiveParams = {
        ...searchParams,
        startDate: formatDateToISO(dates.startDate),
        endDate: formatDateToISO(dates.endDate),
      }
    }
  }

  return (
    <div className="space-y-5">
      <Topbar
        title="Projeção de caixa"
        primaryCta={<CashFlowReportPrintButton />}
      />

      {/* Filters */}
      <FiltersBar searchParams={effectiveParams} />

      {/* Summary Cards */}
      <SummaryCards searchParams={effectiveParams} />

      {/* Cash Flow Chart */}
      <CashFlowChart searchParams={effectiveParams} />

      {/* Table */}
      <CashFlowTable searchParams={effectiveParams} />
    </div>
  )
}
