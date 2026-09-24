'use client'

// UI component Imports
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Component Imports
import { PDVActions } from './PDVActions'
import {
  ListDataTotalEmpty,
  ListDataStatusEmpty,
} from '@/components/common/TableEmptyState'
import { TabNavType, Topbar } from '@/components/common/Topbar'
import { ReviewTodo } from '@/components/common/ReviewTodo'
import { PDVData } from './PDVTable/PDVData'
import { PDVFilter } from './PDVTable/PDVFilter'
import { TableFiltersHeader } from '@/components/common/TableHeader'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

// Action Imports
import { getDataOld } from '@/actions/_cruds'

// Third-party Imports
import { useQuery } from '@tanstack/react-query'

// Icon Imports
import { IconDeviceImacCancel } from '@tabler/icons-react'

export function PDV({ searchParams }: SearchParamsType) {
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
        review="todo"
        title="Frente de caixa"
        tabs={totals?.todos > 0 ? tabs : undefined}
        activeTab={searchParams?.status || 'todos'}
        paramName="status"
      />
      <div className="space-y-2">
        <ReviewTodo rule="FC-1 a FC-20" title="As regras da frente de caixa">
          A tela lista os caixas, mas o atendimento decidido em 24/09 ainda não
          existe: venda aprovada caindo no caixa, conferência de abertura e
          fechamento, sangria e suprimento, troco e pagamento misto, entrada
          mínima dispensada por responsável, comprovante e NFC-e ligada ao
          caixa.
        </ReviewTodo>
        <PDVActions />
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
                  <PDVFilter searchParams={searchParams} />
                </TableFiltersHeader>
                <PDVData searchParams={searchParams} tabs={tabs} />
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
