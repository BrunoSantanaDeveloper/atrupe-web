'use client'

// Components
import { Topbar } from '@/components/common/Topbar'
import { FiltersBar } from './FiltersBar'
import { SummaryCards } from './SummaryCards'
import { ChartsSection } from './ChartsSection'
import { DfcTable } from './DfcTable'
import { DfcReportPrintButton } from './print/DfcReportPrintButton'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function DfcReport({ searchParams }: SearchParamsType) {
  return (
    <div className="space-y-4">
      <Topbar title="Relatório DFC" primaryCta={<DfcReportPrintButton />} />
      <FiltersBar searchParams={searchParams} />
      <SummaryCards searchParams={searchParams} />
      <ChartsSection searchParams={searchParams} />
      <DfcTable searchParams={searchParams} />
    </div>
  )
}
