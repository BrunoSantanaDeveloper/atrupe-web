'use client'

import { useMemo } from 'react'

// Components
import { Topbar } from '@/components/common/Topbar'
import { FiltersBar } from './FiltersBar'
import { SummaryCards } from './SummaryCards'
import { ChartsSection } from './ChartsSection'
import { DfcTable } from './DfcTable'
import { DfcReportPrintButton } from './print/DfcReportPrintButton'

// Lib
import {
  calculatePeriodDates,
  formatDateToISO,
  type PeriodType,
} from '@/lib/filter-utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function DfcReport({ searchParams }: SearchParamsType) {
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
    <div className="space-y-4">
      <Topbar title="Relatório DFC" primaryCta={<DfcReportPrintButton />} />
      <FiltersBar searchParams={searchParams} />
      <SummaryCards searchParams={effectiveSearchParams} />
      <ChartsSection searchParams={effectiveSearchParams} />
      <DfcTable searchParams={effectiveSearchParams} />
    </div>
  )
}
