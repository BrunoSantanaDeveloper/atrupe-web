'use client'

// UI
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OccupancyMap } from '@/app/(app-sidebar)/producao/gerenciador/components/OccupancyMap'

// Components
import {
  ListDataTotalEmpty,
  ListDataStatusEmpty,
} from '@/components/common/TableEmptyState'
import { TabNavType, Topbar } from '@/components/common/Topbar'
import { TableFiltersHeader } from '@/components/common/TableHeader'
import { ListSkeleton } from '@/components/common/ListSkeleton'
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
import { usePermissions } from '@/hooks/usePermissions'
import { FEATURES } from '@/consts/features'
import { DEMO_DATA } from '@/lib/demo'

export function DeliverySchedule({ searchParams }: SearchParamsType) {
  const { canManageDeliverySchedule, hasFeature } = usePlanFeatures()
  // O mapa de ocupação (GP-50, ELITE): o vendedor vê para quando prometer;
  // quem vê a produção abre o setor pelo quadrado
  const { hasPermission } = usePermissions()
  // As telas da produção ainda estão em DEMO_ROUTES: sem a flag, o mapa
  // chamaria a API e os quadrados levariam ao gerenciador, que responde 404
  const withOccupancy =
    DEMO_DATA && hasFeature(FEATURES.PRODUCTION.PRODUCTION_MANAGER)
  const [showOccupancy, setShowOccupancy] = useState(false)

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
      // O serviço pronto que ainda não tem cobrança: a venda faturada na
      // aprovação vai direto a Finalizados (29/10/2026). "A faturar", como
      // "A receber" e "A pagar" no menu Financeiro
      label: 'A faturar',
      count: totals?.faturamento,
    },
    {
      value: '',
      tab: 'todos',
      // Em produção e em entrega juntos: nem o pronto nem o encerrado
      label: 'Em andamento',
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
        title="Agenda de entrega"
        tabs={filteredTabs}
        activeTab={activeTab}
        paramName="status"
        countsLoading={isLoading}
      />
      {withOccupancy && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="neutralOutline"
              size="sm"
              onClick={() => setShowOccupancy((value) => !value)}
            >
              {showOccupancy
                ? 'Esconder a ocupação'
                : 'Ver a ocupação dos setores'}
            </Button>
          </div>
          {showOccupancy && (
            <OccupancyMap
              linkToSector={hasPermission('production:production:view')}
            />
          )}
        </div>
      )}
      <div className="space-y-2">
        <Card>
          {isLoading ? (
            <ListSkeleton cols={4} filters={2} />
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
