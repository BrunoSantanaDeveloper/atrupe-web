'use client'

// UI
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Components
import { OpenCashDialog } from './OpenCash'
import { NewTransferDialog } from './NewTransfer'
import CashControlActions from './CashControlActions'

import {
  ListDataTotalEmpty,
  ListDataStatusEmpty,
} from '@/components/common/TableEmptyState'
import { TabNavType, Topbar } from '@/components/common/Topbar'
import { ReviewTodo } from '@/components/common/ReviewTodo'
import { CashControlData } from './CashControlTable/CashControlData'
import { TableFiltersHeader } from '@/components/common/TableHeader'
import { CashControlFilter } from './CashControlTable/CashControlFilter'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { getDataOld } from '@/actions/_cruds'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconDeviceImacCancel } from '@tabler/icons-react'
import { PermissionGate } from '@/components/common/PermissionGate'

export function CashControl({ searchParams }: SearchParamsType) {
  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['cash-control-totals'],
    queryFn: () => getDataOld({ route: 'cashControlTotalsRoute' }),
  })

  const totals: { [key: string]: number } = {
    aberto: data?.OPEN,
    fechado: data?.CLOSED,
    todos: data?.TOTAL,
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
    <PermissionGate
      permissions={['financial:cash_control:view']}
      fallback={<div>Você não tem permissão para acessar esta página.</div>}
    >
      <div className="space-y-5">
        <Topbar
          title="Controle de caixa"
          tabs={tabs}
          activeTab={searchParams?.status || 'todos'}
          paramName="status"
          primaryCta={
            <PermissionGate permissions={['financial:cash_control:create']}>
              <NewTransferDialog />
            </PermissionGate>
          }
          secondaryCta={
            <PermissionGate permissions={['financial:cash_control:create']}>
              <OpenCashDialog searchParams={searchParams} />
            </PermissionGate>
          }
        />
        <ReviewTodo rule="LITE" title="Controle de caixa em desenvolvimento">
          Depende das contas bancárias, do provisionamento e da compensação de
          parcelas, que são recursos da LITE ainda não concluídos. No START a
          empresa usa só a conta Caixa Empresa.
        </ReviewTodo>
        <div className="space-y-2">
          <CashControlActions searchParams={searchParams} />
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
                    <CashControlFilter searchParams={searchParams} />
                  </TableFiltersHeader>
                  <CashControlData searchParams={searchParams} tabs={tabs} />
                </>
              )
            ) : (
              <ListDataTotalEmpty
                icon={IconDeviceImacCancel}
                title="Sem caixas cadastrados"
                description="Abra seu primeiro caixa"
                cta={
                  <PermissionGate
                    permissions={['financial:cash_control:create']}
                  >
                    <OpenCashDialog searchParams={searchParams} />
                  </PermissionGate>
                }
              />
            )}
          </Card>
        </div>
      </div>
    </PermissionGate>
  )
}
