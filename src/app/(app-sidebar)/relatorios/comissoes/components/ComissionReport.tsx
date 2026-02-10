'use client'

// Components
import { Topbar } from '@/components/common/Topbar'
import { FiltersBar } from './FiltersBar'
import { SummaryCards } from './SummaryCards'
import { CommissionTable } from './CommissionTable'

// Icons
import { IconPrinter, IconFileSpreadsheet } from '@tabler/icons-react'

// UI
import { Button } from '@/components/ui/button'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function ComissionReport({ searchParams }: SearchParamsType) {
  return (
    <div className="space-y-4">
      <Topbar
        title="Comissões"
        primaryCta={
          <div className="flex items-center gap-2">
            <Button
              variant="neutralOutline"
              size="iconMd"
              RightIcon={IconPrinter}
            />
            <Button
              variant="neutralOutline"
              size="iconMd"
              RightIcon={IconFileSpreadsheet}
            />
          </div>
        }
      />

      {/* Filters */}
      <FiltersBar searchParams={searchParams} />

      {/* Summary Cards */}
      <SummaryCards searchParams={searchParams} />

      {/* Table */}
      <CommissionTable searchParams={searchParams} />
    </div>
  )
}
