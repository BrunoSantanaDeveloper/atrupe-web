'use client'

// Components
import { Topbar } from '@/components/common/Topbar'
import { FiltersBar } from './FiltersBar'
import { SectorCardsGrid } from './SectorCardsGrid'

// Icons
import { IconPrinter, IconFileSpreadsheet } from '@tabler/icons-react'

// UI
import { Button } from '@/components/ui/button'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function SectorReport({ searchParams }: SearchParamsType) {
  return (
    <div className="space-y-4">
      <Topbar
        title="Resultados por setor"
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

      {/* Sector Cards Grid */}
      <SectorCardsGrid searchParams={searchParams} />
    </div>
  )
}
