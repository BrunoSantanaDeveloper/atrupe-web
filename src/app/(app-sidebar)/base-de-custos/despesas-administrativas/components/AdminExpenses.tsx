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
import { LoadError } from '../../components/LoadError'
import { AdminExpensesData } from './AdminExpensesData'
import { EditCriterionModal } from './EditCriterion'
import { ExpenseAllocationDialog } from './ExpenseAllocationDialog'
import { AdminExpensesFilter } from './AdminExpensesFilter'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { TableFiltersHeader } from '@/components/common/TableHeader'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { AdminExpenseAccount } from '../../types'

// Actions
import { getAdminExpenses, getAdminExpensesTotals } from '@/actions/cost-base'

// Hooks / Store / Consts
import { formatReferenceMonth } from '../../reference-month'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconReceipt } from '@tabler/icons-react'

export function AdminExpenses({ searchParams }: SearchParamsType) {
  const [editing, setEditing] = useState<AdminExpenseAccount>()
  const [allocating, setAllocating] = useState<AdminExpenseAccount>()

  const { data: totals, isLoading: isLoadingTotals } = useQuery({
    staleTime: Infinity,
    queryKey: ['admin-expense-totals'],
    queryFn: () => getAdminExpensesTotals(),
  })

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['admin-expense-list', searchParams],
    queryFn: () => getAdminExpenses({ filters: searchParams }),
  })

  const accounts = data?.data?.accounts || []
  const hasAnyAccount = (totals?.data?.total ?? 0) > 0
  const failed = [totals, data].find((response) => response?.success === false)
  const referenceMonth = formatReferenceMonth(data?.data?.referenceMonth)

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <SummaryCards totals={totals?.data} isLoading={isLoadingTotals} />
        <Card>
          {isLoading || isLoadingTotals ? (
            <TableSkeleton cols={8} rows={8} />
          ) : failed ? (
            <LoadError message={failed.message} />
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
                {referenceMonth ? (
                  <p className="text-sm text-gray pb-3">
                    Médias calculadas até {referenceMonth}
                  </p>
                ) : null}
              </TableFiltersHeader>
              {accounts.length ? (
                <AdminExpensesData
                  accounts={accounts}
                  onEdit={setEditing}
                  onAllocate={setAllocating}
                />
              ) : (
                <FilteredDataEmpty description="Nenhuma conta atende aos filtros escolhidos." />
              )}
            </>
          )}
        </Card>
        <EditCriterionModal
          account={editing}
          open={!!editing}
          onOpenChange={() => setEditing(undefined)}
        />
        <ExpenseAllocationDialog
          account={allocating}
          open={!!allocating}
          onOpenChange={() => setAllocating(undefined)}
        />
      </div>
    </TooltipProvider>
  )
}
