'use client'

// Components
import { Topbar } from '@/components/common/Topbar'

// Icons
import { IconPrinter } from '@tabler/icons-react'

// UI
import { Button } from '@/components/ui/button'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function FinancialReport({ searchParams }: SearchParamsType) {
  console.info(searchParams)

  return (
    <div className="space-y-5">
      <Topbar
        title="Relatório Financeiro"
        primaryCta={
          <Button
            variant="neutralOutline"
            size="iconMd"
            RightIcon={IconPrinter}
          />
        }
      />
    </div>
  )
}
