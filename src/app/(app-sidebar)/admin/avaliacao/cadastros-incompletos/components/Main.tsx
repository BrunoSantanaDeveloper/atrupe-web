'use client'

// UI
import { Card } from '@/components/ui/card'

// Components
import { Data } from './Table/Data'
import { Filter } from './Table/Filter'
import { Topbar } from '@/components/common/Topbar'
import { TableFiltersHeader } from '@/components/common/TableHeader'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function Main({ searchParams }: SearchParamsType) {
  return (
    <div className="space-y-5">
      <Topbar title="Cadastros incompletos" />
      <div>
        <Card>
          <>
            {/* Filters */}
            <TableFiltersHeader searchParams={searchParams}>
              <Filter searchParams={searchParams} />
            </TableFiltersHeader>
            {/* Table */}
            <Data searchParams={searchParams} />
          </>
        </Card>
      </div>
    </div>
  )
}
