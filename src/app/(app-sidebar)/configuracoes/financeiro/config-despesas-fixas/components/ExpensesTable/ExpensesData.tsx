'use client'

// React
import { useState } from 'react'

// Components
import { TableSkeletonRows } from '@/components/common/TableSkeleton'
import { FetchingRegion } from '@/components/common/FetchingRegion'
import { TablePagination } from '@/components/common/TablePagination'
import { FilteredDataEmpty } from '@/components/common/TableEmptyState'
import { PermissionGate } from '@/components/common/PermissionGate'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CardFooter, CardContent } from '@/components/ui/card'

// Types
import type { FixedExpensesConfigType } from '@/types/settings/fixedExpenses'
import { SearchParamsType } from '@/types/coreTypes'
import type { TabNavType } from '@/components/common/Topbar'

// Actions
import { getData } from '@/actions/_cruds'

// Libs
import { formatCurrencyToBrl } from '@/lib/utils'

// Third-party
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import {
  NewFixedExpense,
  NewFixedExpenseTriggerButton,
} from '../EditFixedExpense'
import { fixedExpensesRecurringTypeObj } from '@/consts/fixedExpenses'

interface Props extends SearchParamsType {
  tabs?: TabNavType[]
}

export function FixedExpensesData({ searchParams, tabs }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [selectedFixedExpenseId, setSelectedFixedExpenseId] =
    useState<string>('')
  const status =
    tabs?.find((tab) => tab.tab === searchParams.status)?.value || ''
  const filters = { ...searchParams, status }

  const { data, isLoading, isPlaceholderData } = useQuery({
    // Filtro, busca e página mantêm a lista anterior até a nova chegar
    placeholderData: keepPreviousData,
    staleTime: Infinity,
    queryKey: ['fixed-expenses-config', searchParams],
    queryFn: () =>
      getData({
        route: '/financial/scheduled-expense/by-level1/payable',
        filters,
      }),
  })
  const fixedExpenses: FixedExpensesConfigType[] = data?.data || []
  const hasData = fixedExpenses.length

  return (
    <>
      <CardContent>
        <FetchingRegion isFetching={isPlaceholderData}>
          {isLoading || hasData ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 text-gray-600">
                  <TableHead>Referência</TableHead>
                  <TableHead>Plano de conta</TableHead>
                  <TableHead>Recorrência</TableHead>
                  <TableHead>Dia vencimento</TableHead>
                  <TableHead>Valor Padrão</TableHead>
                  <TableHead className="w-[10px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeletonRows cols={6} />
                ) : (
                  fixedExpenses.map((item) => (
                    <TableRow key={item?.id}>
                      <TableCell>
                        <p className="font-medium">{item?.supplier?.name}</p>
                        <p className="text-sm text-gray-500">
                          {item?.description}
                        </p>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        02.{item?.nature?.level2}.{item?.nature?.code}.
                        {item?.subCategory?.code} -{' '}
                        {item?.subCategory?.description}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <Badge
                          variant={
                            fixedExpensesRecurringTypeObj[item?.recurringType]
                              ?.variant
                          }
                        >
                          {
                            fixedExpensesRecurringTypeObj[item?.recurringType]
                              ?.text
                          }
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {item?.dueDay}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatCurrencyToBrl(item?.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <TooltipProvider>
                            <PermissionGate
                              permissions={[
                                'financial_settings:fixed_expenses:edit',
                              ]}
                            >
                              <NewFixedExpenseTriggerButton
                                editMode
                                onOpenChange={() => {
                                  setSelectedFixedExpenseId(item?.id)
                                  setOpenDialog('edit-fixed-expense')
                                }}
                              />
                            </PermissionGate>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : (
            <FilteredDataEmpty
              title="Despesa fixa não encontrada"
              description="Sua busca não encontrou nenhum resultado. Tente novamente ou cadastre uma nova despesa fixa"
              cta={
                <PermissionGate
                  permissions={['financial_settings:fixed_expenses:create']}
                >
                  <NewFixedExpenseTriggerButton
                    onOpenChange={() => setOpenDialog('new-fixed-expense')}
                  />
                </PermissionGate>
              }
            />
          )}
        </FetchingRegion>
      </CardContent>
      <NewFixedExpense
        open={openDialog === 'new-fixed-expense'}
        onOpenChange={() => setOpenDialog('')}
      />
      <NewFixedExpense
        open={openDialog === 'edit-fixed-expense'}
        editMode
        fixedExpenseId={selectedFixedExpenseId}
        onOpenChange={() => {
          setOpenDialog('')
          setSelectedFixedExpenseId('')
        }}
      />
      {isLoading || hasData ? (
        <CardFooter>
          <TablePagination
            searchParams={searchParams}
            lastPage={data?.lastPage}
            isLoading={isLoading}
          />
        </CardFooter>
      ) : null}
    </>
  )
}
