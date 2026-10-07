'use client'

// React / Next
import { useState } from 'react'

// UI
import { Card } from '@/components/ui/card'
import { TooltipProvider } from '@/components/ui/tooltip'

// Components
import {
  FilteredDataEmpty,
  ListDataTotalEmpty,
} from '@/components/common/TableEmptyState'
import { SummaryCards } from './SummaryCards'
import { AdminExpensesData } from './AdminExpensesData'
import { EditCriterionModal } from './EditCriterion'
import { AdminExpensesFilter } from './AdminExpensesFilter'
import { ListSkeleton } from '@/components/common/ListSkeleton'
import { FetchingRegion } from '@/components/common/FetchingRegion'
import { TableFiltersHeader } from '@/components/common/TableHeader'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { AdminExpenseAccount } from '../../types'

// Actions
import { getAdminExpenses, getAdminExpensesTotals } from '@/actions/cost-base'

// Third-party
import { useQuery, keepPreviousData } from '@tanstack/react-query'

// Icons
import { IconReceipt } from '@tabler/icons-react'

const formatReferenceMonth = (month?: string) => {
  if (!month) return ''

  const [year, monthNumber] = month.split('-').map(Number)

  return new Date(year, monthNumber - 1, 1)
    .toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    .replace('.', '')
    .replace(' de ', '/')
}

export function AdminExpenses({ searchParams }: SearchParamsType) {
  const [editing, setEditing] = useState<AdminExpenseAccount>()

  const { data: totals, isLoading: isLoadingTotals } = useQuery({
    staleTime: Infinity,
    queryKey: ['admin-expense-totals'],
    queryFn: () => getAdminExpensesTotals(),
  })

  const { data, isLoading, isPlaceholderData } = useQuery({
    staleTime: Infinity,
    // Filtro e busca mantêm a lista anterior até a nova chegar
    placeholderData: keepPreviousData,
    queryKey: ['admin-expense-list', searchParams],
    queryFn: () => getAdminExpenses({ filters: searchParams }),
  })

  const accounts = data?.data?.accounts || []
  const hasAnyAccount = (totals?.data?.total ?? 0) > 0

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <SummaryCards totals={totals?.data} isLoading={isLoadingTotals} />
        <Card>
          {isLoadingTotals ? (
            <ListSkeleton cols={8} filters={2} />
          ) : !hasAnyAccount ? (
            <ListDataTotalEmpty
              icon={IconReceipt}
              title="Nenhuma despesa administrativa encontrada"
              description="As contas aparecem aqui assim que houver lançamentos nelas."
            />
          ) : (
            <>
              <TableFiltersHeader searchParams={searchParams}>
                <AdminExpensesFilter searchParams={searchParams} />
                <p className="text-sm text-gray pb-3">
                  Médias calculadas até{' '}
                  {formatReferenceMonth(data?.data?.referenceMonth)}
                </p>
              </TableFiltersHeader>
              <FetchingRegion isFetching={isPlaceholderData}>
                {isLoading || accounts.length ? (
                  <AdminExpensesData
                    accounts={accounts}
                    isLoading={isLoading}
                    onEdit={setEditing}
                  />
                ) : (
                  <FilteredDataEmpty description="Nenhuma conta atende aos filtros escolhidos." />
                )}
              </FetchingRegion>
            </>
          )}
        </Card>
        <EditCriterionModal
          account={editing}
          open={!!editing}
          onOpenChange={() => setEditing(undefined)}
        />
      </div>
    </TooltipProvider>
  )
}
