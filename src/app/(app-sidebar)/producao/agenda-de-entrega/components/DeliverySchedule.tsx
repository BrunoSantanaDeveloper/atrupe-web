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
import { ReviewTodo } from '@/components/common/ReviewTodo'
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

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

export function DeliverySchedule({ searchParams }: SearchParamsType) {
  const { canManageDeliverySchedule } = usePlanFeatures()

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
      value: '',
      tab: 'todos',
      label: 'Todos os ativos',
      count: totals?.todos,
    },
    {
      value: 'DONE',
      tab: 'finalizados',
      label: 'Finalizados',
      count: totals?.finalizados,
    },
  ]

  // Filtrar abas baseado no plano
  const filteredTabs = canManageDeliverySchedule()
    ? tabs
    : tabs.filter((tab) => tab.tab !== 'producao' && tab.tab !== 'todos')

  const statusLabel =
    tabs?.find((tab) => tab.tab === searchParams.status)?.label || ''

  // Determinar aba ativa - se a aba atual não existe nas filtradas, usar padrão baseado no plano
  const activeTab = (() => {
    const defaultTab = canManageDeliverySchedule() ? 'todos' : 'entrega'
    const currentTab = searchParams?.status || defaultTab
    const tabExists = filteredTabs.some((tab) => tab.tab === currentTab)
    if (tabExists) return currentTab
    return defaultTab
  })()

  return (
    <div className="space-y-5">
      <Topbar
        review="todo"
        title="Agenda de entrega"
        tabs={filteredTabs}
        activeTab={activeTab}
        paramName="status"
      />
      <div className="space-y-2">
        <ReviewTodo rule="PCP-7" title="A agenda como quadro de gestão à vista">
          O que foi decidido e não existe: a linha do trabalho mostrando os
          ícones de todos os setores envolvidos, o detalhamento por item, o
          clique que conclui a etapa e o alerta quando o atraso compromete a
          data de entrega.
        </ReviewTodo>
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
              title="Nenhuma entrega agendada"
            />
          )}
        </Card>
      </div>
    </div>
  )
}
