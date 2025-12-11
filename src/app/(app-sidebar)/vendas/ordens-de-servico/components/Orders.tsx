'use client'

// React
import { useState } from 'react'

// UI
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Components
import {
  ListDataTotalEmpty,
  ListDataStatusEmpty,
} from '@/components/common/TableEmptyState'
import { OrdersData } from './OrdersTable/OrdersData'
import { OrdersFilter } from './OrdersTable/OrdersFilter'
import { TabNavType, Topbar } from '@/components/common/Topbar'
import { TableFiltersHeader } from '@/components/common/TableHeader'
import {
  NewQuotationModal,
  NewQuotationTriggerButton,
} from '../../orcamentos/components/NewQuotation'
import {
  ImportOrderModal,
  ImportOrderTriggerButton,
} from './ImportOrder/ImportOrderModal'
import { PermissionGate } from '@/components/common/PermissionGate'
import { TooltipProvider } from '@/components/ui/tooltip'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { getDataOld } from '@/actions/_cruds'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconNewsOff } from '@tabler/icons-react'

import { usePlanFeatures } from '@/hooks/usePlanFeatures'

export function Orders({ searchParams }: SearchParamsType) {
  const [openDialog, setOpenDialog] = useState<string>('')

  const { canManageDeliverySchedule } = usePlanFeatures()

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['order-totals'],
    queryFn: () => getDataOld({ route: 'orderTotalsRoute' }),
  })

  const totals: { [key: string]: number } = {
    aguardando: data?.PENDING,
    producao: data?.IN_PRODUCTION,
    finalizadas: data?.FINISHED,
    canceladas: data?.CANCELED,
    todas: data?.TOTAL,
  }

  const status = searchParams.status
  const statusEmpty = totals?.[status] === 0

  const allTabs: TabNavType[] = [
    {
      value: 'PENDING',
      tab: 'aguardando',
      label: 'Aguardando',
      count: totals?.aguardando,
    },
    {
      value: 'IN_PRODUCTION',
      tab: 'producao',
      label: 'Em produção / Entrega',
      count: totals?.producao,
    },
    {
      value: 'FINISHED',
      tab: 'finalizadas',
      label: canManageDeliverySchedule() ? 'Finalizadas' : 'Aprovadas',
      count: totals?.finalizadas,
    },
    {
      value: 'CANCELED',
      tab: 'canceladas',
      label: 'Canceladas',
      count: totals?.canceladas,
    },
    {
      value: '',
      tab: 'todas',
      label: 'Todas',
      count: totals?.todas,
    },
  ]

  const tabs = canManageDeliverySchedule()
    ? allTabs
    : allTabs.filter(
        (tab) => tab.value !== 'PENDING' && tab.value !== 'IN_PRODUCTION',
      )

  const statusLabel = tabs?.find((tab) => tab.tab === status)?.label

  return (
    <PermissionGate permissions={['sale:order:view']}>
      <div className="space-y-5">
        <Topbar
          title="Ordens de serviço"
          tabs={tabs}
          activeTab={status}
          paramName="status"
          primaryCta={
            <TooltipProvider>
              <div className="flex gap-2">
                <ImportOrderTriggerButton
                  onOpenChange={(open) => setOpenDialog(open ? 'import' : '')}
                />
                <NewQuotationTriggerButton
                  onOpenChange={(open) => setOpenDialog(open ? 'new' : '')}
                />
              </div>
            </TooltipProvider>
          }
        />
        <div>
          <Card>
            {isLoading ? (
              <Skeleton className="h-[calc(100vh-150px)]" />
            ) : totals?.todas && totals?.todas > 0 ? (
              statusEmpty ? (
                <ListDataStatusEmpty
                  title={`Nenhuma ordem de serviço para o status ${statusLabel ? `: ${statusLabel}` : 'selecionado'}`}
                  icon={IconNewsOff}
                />
              ) : (
                <>
                  {/* Filters */}
                  <TableFiltersHeader searchParams={searchParams}>
                    <OrdersFilter searchParams={searchParams} />
                  </TableFiltersHeader>
                  {/* Table */}
                  <OrdersData searchParams={searchParams} tabs={tabs} />
                </>
              )
            ) : (
              <ListDataTotalEmpty
                icon={IconNewsOff}
                title="Sem ordens de serviço"
                description="Cadastre um orçamento"
                cta={
                  <NewQuotationTriggerButton
                    onOpenChange={(open) => setOpenDialog(open ? 'new' : '')}
                  />
                }
              />
            )}
          </Card>
          <NewQuotationModal
            open={openDialog === 'new'}
            onOpenChange={(open) => {
              setOpenDialog(open ? 'new' : '')
            }}
          />
          <ImportOrderModal
            open={openDialog === 'import'}
            onOpenChange={(open) => {
              setOpenDialog(open ? 'import' : '')
            }}
          />
        </div>
      </div>
    </PermissionGate>
  )
}
