'use client'

// UI
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Components
import {
  ListDataTotalEmpty,
  ListDataStatusEmpty,
} from '@/components/common/TableEmptyState'
import { TabNavType, Topbar } from '@/components/common/Topbar'
import { TableFiltersHeader } from '@/components/common/TableHeader'
import { DeliveryScheduleData } from './DeliveryScheduleTable/DeliveryScheduleData'
import { DeliveryScheduleFilter } from './DeliveryScheduleTable/DeliveryScheduleFilter'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { getDataOld } from '@/actions/_cruds'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconReportMoney } from '@tabler/icons-react'

export function DeliverySchedule({ searchParams }: SearchParamsType) {
  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['delivery-schedule-totals'],
    queryFn: () => getDataOld({ route: 'deliveryScheduleTotalsRoute' }),
  })

  const totals: { [key: string]: number } = {
    producao: data?.IN_PRODUCTION,
    entrega: data?.DELIVERING,
    faturamento: data?.FINISHED,
    finalizados: data?.DONE,
    todos: data?.TOTAL,
  }

  const status = searchParams.status
  const statusEmpty = totals?.[status] === 0

  const tabs: TabNavType[] = [
    {
      value: 'IN_PRODUCTION',
      tab: 'producao',
      label: 'Produção',
      count: totals?.producao,
    },
    {
      value: 'DELIVERING',
      tab: 'entrega',
      label: 'Entrega',
      count: totals?.entrega,
    },
    {
      value: 'FINISHED',
      tab: 'faturamento',
      label: 'Faturamento',
      count: totals?.faturamento,
    },
    {
      value: 'DONE',
      tab: 'finalizados',
      label: 'Finalizados',
      count: totals?.finalizados,
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
        title="Agenda de entrega"
        tabs={tabs}
        activeTab={searchParams?.status || 'todos'}
        paramName="status"
      />
      <div>
        <Card>
          {isLoading ? (
            <Skeleton className="h-[calc(100vh-150px)]" />
          ) : totals?.todos && totals?.todos > 0 ? (
            statusEmpty ? (
              <ListDataStatusEmpty
                title={`Nenhuma entrega para o status: ${statusLabel}`}
                icon={IconReportMoney}
              />
            ) : (
              <>
                <TableFiltersHeader searchParams={searchParams}>
                  <DeliveryScheduleFilter searchParams={searchParams} />
                </TableFiltersHeader>
                <DeliveryScheduleData searchParams={searchParams} tabs={tabs} />
              </>
            )
          ) : (
            <ListDataTotalEmpty
              icon={IconReportMoney}
              title="Sem entregas agendadas"
            />
          )}
        </Card>
      </div>
    </div>
  )
}
