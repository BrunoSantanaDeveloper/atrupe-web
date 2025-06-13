'use client'

// UI component Imports
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Component Imports
import { CheckoutsActions } from './CheckoutsActions'
import {
  ListDataTotalEmpty,
  ListDataStatusEmpty,
} from '@/components/common/TableEmptyState'
import { CheckoutsData } from './CheckoutsTable/CheckoutsData'
import { TabNavType, Topbar } from '@/components/common/Topbar'
import { CheckoutsFilter } from './CheckoutsTable/CheckoutsFilter'
import { TableFiltersHeader } from '@/components/common/TableHeader'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

// Action Imports
import { getDataOld } from '@/actions/_cruds'

// Third-party Imports
import { useQuery } from '@tanstack/react-query'

// Icon Imports
import { IconDeviceImacCancel } from '@tabler/icons-react'

export function Checkouts({ searchParams }: SearchParamsType) {
  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['checkouts-totals'],
    queryFn: () => getDataOld({ route: 'checkoutsTotalsRoute' }),
  })

  const totals: { [key: string]: number } = {
    aberto: data?.open,
    fechado: data?.closed,
    todos: data?.total,
  }

  const status = searchParams.status
  const statusEmpty = totals?.[status] === 0

  const tabs: TabNavType[] = [
    {
      value: 'OPEN',
      tab: 'aberto',
      label: 'Aberto',
      count: totals?.aberto,
    },
    {
      value: 'CLOSED',
      tab: 'fechado',
      label: 'Fechado',
      count: totals?.fechado,
    },
    {
      value: '',
      tab: 'todos',
      label: 'Todos',
      count: totals?.todos,
    },
  ]

  const statusLabel =
    tabs?.find((tab) => tab.tab === searchParams.status)?.label || ''

  return (
    <div className="space-y-5">
      <Topbar
        title="Frente de caixa"
        tabs={totals?.todos > 0 ? tabs : undefined}
        activeTab={searchParams?.status || 'todos'}
        paramName="status"
      />
      <div className="space-y-2">
        <CheckoutsActions />
        <Card>
          {isLoading ? (
            <Skeleton className="h-[calc(100vh-150px)]" />
          ) : totals?.todos && totals?.todos > 0 ? (
            statusEmpty ? (
              <ListDataStatusEmpty
                title={`Nenhum caixa para o status: ${statusLabel}`}
                icon={IconDeviceImacCancel}
              />
            ) : (
              <>
                <TableFiltersHeader searchParams={searchParams}>
                  <CheckoutsFilter searchParams={searchParams} />
                </TableFiltersHeader>
                <CheckoutsData searchParams={searchParams} tabs={tabs} />
              </>
            )
          ) : (
            <ListDataTotalEmpty
              icon={IconDeviceImacCancel}
              title="Sem frente de caixa aberto"
              description="Escolha um dos caixas acima para abrir"
            />
          )}
        </Card>
      </div>
    </div>
  )
}
