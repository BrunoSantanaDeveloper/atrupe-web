'use client'

// UI
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Components
import { TableData } from './TableData'
import { NewCategoryDialog } from './NewCategoryDialog'
import { TabNavType, Topbar } from '@/components/common/Topbar'
import { TableFiltersHeader } from '@/components/common/TableHeader'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { getDataOld } from '@/actions/_cruds'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { TableFilter } from './TableFilter'

export function Main({ searchParams }: SearchParamsType) {
  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['accounts-plan-totals'],
    queryFn: () => getDataOld({ route: 'accountsPlanTotalsRoute' }),
  })

  const totals: { [key: string]: number } = {
    ativos: data?.ACTIVES,
    inativos: data?.INACTIVES,
    todos: data?.TOTAL,
  }

  const tabs: TabNavType[] = [
    {
      value: 'ACTIVES',
      tab: 'ativos',
      label: 'Ativos',
      count: totals?.ativos,
    },
    {
      value: 'INACTIVES',
      tab: 'inativos',
      label: 'Inativos',
      count: totals?.inativos,
    },
  ]

  return (
    <div className="space-y-5">
      <Topbar
        title="Plano de contas"
        tabs={tabs}
        previousPage="/configuracoes/financeiro"
        activeTab={searchParams?.status || 'ativos'}
        paramName="status"
        primaryCta={<NewCategoryDialog searchParams={searchParams} />}
      />
      <div>
        <Card>
          {isLoading ? (
            <Skeleton className="h-[calc(100vh-150px)]" />
          ) : (
            <>
              <TableFiltersHeader searchParams={searchParams}>
                <TableFilter searchParams={searchParams} />
              </TableFiltersHeader>
              <TableData searchParams={searchParams} tabs={tabs} />
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
