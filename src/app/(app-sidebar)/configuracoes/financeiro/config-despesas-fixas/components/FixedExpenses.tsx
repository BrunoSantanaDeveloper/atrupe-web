'use client'

import { useState } from 'react'

// UI
import { Card, CardContent } from '@/components/ui/card'

// Components
import {
  ListDataTotalEmpty,
  ListDataStatusEmpty,
} from '@/components/common/TableEmptyState'
import { TabNavType, Topbar } from '@/components/common/Topbar'
import {
  NewFixedExpense,
  NewFixedExpenseTriggerButton,
} from './EditFixedExpense'
import { PermissionGate } from '@/components/common/PermissionGate'
import { TableSkeleton } from '@/components/common/TableSkeleton'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { getDataOld } from '@/actions/_cruds'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconCalendarDollar, IconPackageOff } from '@tabler/icons-react'
import { FixedExpensesData } from './ExpensesTable/ExpensesData'

export function FixedExpenses({ searchParams }: SearchParamsType) {
  const [openDialog, setOpenDialog] = useState<string>('')
  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['fixed-expenses-totals'],
    queryFn: () => getDataOld({ route: 'fixedExpensesConfigTotalsRoute' }),
  })

  const totals: { [key: string]: number } = {
    ativos: data?.ACTIVE,
    inativos: data?.INACTIVE,
    todos: data?.TOTAL,
  }

  const status = searchParams.status
  const statusEmpty = totals?.[status] === 0

  const tabs: TabNavType[] = [
    {
      value: 'ACTIVE',
      tab: 'ativos',
      label: 'Ativos',
      count: totals?.ativos,
    },
    {
      value: 'INACTIVE',
      tab: 'inativos',
      label: 'Inativos',
      count: totals?.inativos,
    },
  ]

  const statusLabel =
    tabs?.find((tab) => tab.tab === searchParams.status)?.label || ''

  return (
    <PermissionGate permissions={['financial_settings:fixed_expenses:view']}>
      <div className="space-y-5">
        <Topbar
          title="Despesas fixas"
          tabs={tabs}
          activeTab={searchParams?.status || 'ativos'}
          paramName="status"
          countsLoading={isLoading}
          primaryCta={
            <>
              <PermissionGate
                permissions={['financial_settings:fixed_expenses:create']}
              >
                <NewFixedExpenseTriggerButton
                  onOpenChange={(open) => {
                    if (open) setOpenDialog('new-fixed-expense')
                  }}
                />
              </PermissionGate>
            </>
          }
        />
        <div>
          <Card>
            {isLoading ? (
              // Esta lista não tem barra de filtros: só a tabela no formato final
              <CardContent>
                <TableSkeleton cols={6} />
              </CardContent>
            ) : totals?.todos && totals?.todos > 0 ? (
              statusEmpty ? (
                <ListDataStatusEmpty
                  title={`Nenhuma despesa fixa para o status: ${statusLabel}`}
                  icon={IconPackageOff}
                />
              ) : (
                <>
                  <FixedExpensesData searchParams={searchParams} tabs={tabs} />
                </>
              )
            ) : (
              <ListDataTotalEmpty
                icon={IconCalendarDollar}
                title="Nenhuma despesa fixa cadastrada"
                description="Cadastre sua primeira despesa fixa"
                cta={
                  <PermissionGate
                    permissions={['financial_settings:fixed_expenses:create']}
                  >
                    <NewFixedExpenseTriggerButton
                      onOpenChange={(open) => {
                        if (open) setOpenDialog('new-fixed-expense')
                      }}
                    />
                  </PermissionGate>
                }
              />
            )}
          </Card>
        </div>
        <NewFixedExpense
          open={openDialog === 'new-fixed-expense'}
          onOpenChange={() => setOpenDialog('')}
        />
      </div>
    </PermissionGate>
  )
}
