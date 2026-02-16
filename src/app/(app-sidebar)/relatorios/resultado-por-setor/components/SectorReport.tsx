'use client'

// Components
import { Topbar } from '@/components/common/Topbar'
import { FiltersBar } from './FiltersBar'
import { SectorCardsGrid } from './SectorCardsGrid'
import { SectorReportPrintButton } from './print/SectorReportPrintButton'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function SectorReport({ searchParams }: SearchParamsType) {
  return (
    <div className="space-y-4">
      <Topbar
        title="Resultados por setor"
        primaryCta={<SectorReportPrintButton />}
      />

      {/* Filters */}
      <FiltersBar searchParams={searchParams} />

      {/* Sector Cards Grid */}
      <SectorCardsGrid searchParams={searchParams} />
    </div>
  )
}
