'use client'

// UI component Imports
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Component Imports
import CheckoutActions from './CheckoutActions'
import {
  ListDataTotalEmpty,
  ListDataStatusEmpty,
} from '@/components/common/TableEmptyState'
import { CheckoutData } from './CheckoutTable/CheckoutData'
import { TabNavType, Topbar } from '@/components/common/Topbar'
import { CheckoutFilter } from './CheckoutTable/CheckoutFilter'
import { TableFiltersHeader } from '@/components/common/TableHeader'
import { NewTransaction } from '../../../_components/transactions/NewTransaction'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

// Action Imports
import { getDataOld } from '@/actions/_cruds'

// Third-party Imports
import { useQuery } from '@tanstack/react-query'

// Icon Imports
import { IconReportMoney } from '@tabler/icons-react'
import { PermissionGate } from '@/components/common/PermissionGate'

interface Props extends SearchParamsType {
  id: string
}

export function Checkout({ searchParams, id }: Props) {
  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['checkout-totals', id],
    queryFn: () => getDataOld({ route: 'checkoutTotalsRoute' }),
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
        tabs={tabs}
        activeTab={searchParams?.status || 'todos'}
        paramName="status"
        previousPage="/financeiro/frente-de-caixa"
        secondaryCta={
          <PermissionGate
            permissions={['financial:payable:create', 'financial:flow:create']}
          >
            <NewTransaction type="payable" searchParams={searchParams} />
          </PermissionGate>
        }
        primaryCta={
          <PermissionGate
            permissions={[
              'financial:receivable:create',
              'financial:flow:create',
            ]}
          >
            <NewTransaction type="receivable" searchParams={searchParams} />
          </PermissionGate>
        }
      />
      <div className="space-y-2">
        <CheckoutActions />
        <Card>
          {isLoading ? (
            <Skeleton className="h-[calc(100vh-150px)]" />
          ) : totals?.todos && totals?.todos > 0 ? (
            statusEmpty ? (
              <ListDataStatusEmpty
                title={`Nenhum caixa para o status: ${statusLabel}`}
                icon={IconReportMoney}
              />
            ) : (
              <>
                <TableFiltersHeader searchParams={searchParams}>
                  <CheckoutFilter searchParams={searchParams} />
                </TableFiltersHeader>
                <CheckoutData searchParams={searchParams} tabs={tabs} id={id} />
              </>
            )
          ) : (
            <ListDataTotalEmpty
              icon={IconReportMoney}
              title="Sem caixas cadastrados"
              description="Abra seu primeiro caixa"
            />
          )}
        </Card>
      </div>
    </div>
  )
}
