'use client'

// React
import { useState } from 'react'

// Components
import { FixedExpensesFilter } from './FixedExpensesFilter'
import { Topbar } from '@/components/common/Topbar'
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { TableFiltersHeader } from '@/components/common/TableHeader'
import { TablePagination } from '@/components/common/TablePagination'
import { FilteredDataEmpty } from '@/components/common/TableEmptyState'
import { TransactionDetailsDialog } from '@/app/(app-sidebar)/financeiro/_components/transactions/Actions/TransactionDetails'
import { EditInstallments } from '@/app/(app-sidebar)/financeiro/_components/transactions/Actions/EditInstallments'
import { LaunchMovementModal } from './LaunchMovementModal'
import {
  NewFixedExpense,
  NewFixedExpenseTriggerButton,
} from '@/app/(app-sidebar)/configuracoes/financeiro/config-despesas-fixas/components/EditFixedExpense'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardFooter, CardContent } from '@/components/ui/card'

// Actions
import { createItemNew, getDataOld, deleteItemNew } from '@/actions/_cruds'
import { toast } from 'sonner'

// Libs
import { formatCurrencyToBrl, truncateString } from '@/lib/utils'
import { formatToLocaleDate } from '@/lib/formatDate'

// Third-party
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Consts
import { fixedExpensesRecurringTypeObj } from '@/consts/fixedExpenses'

// Icons
import {
  IconPlus,
  IconMinus,
  IconSearch,
  IconRefreshDot,
} from '@tabler/icons-react'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type {
  FixedExpensesType,
  FixedExpenseItemType,
} from '@/types/financial/fixedExpenses'
import type { TransactionListType } from '@/types/financial/financialFlow'
// import { queryClient } from '@/contexts/queryProvider' TODO: Verificar se está sendo usado em outros lugares

const EMPTY_STATUS = 'NOT_LAUNCHED'

export function FixedExpenses({ searchParams }: SearchParamsType) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState<string[]>([])
  const [openDialog, setOpenDialog] = useState('')
  const [selectedTransaction, setSelectedTransaction] =
    useState<FixedExpenseItemType | null>(null)
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false)
  const [selectedExpenseForLaunch, setSelectedExpenseForLaunch] =
    useState<FixedExpenseItemType | null>(null)

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['fixed-expenses-list', searchParams],
    queryFn: () =>
      getDataOld({ route: 'fixedExpensesListRoute', filters: searchParams }),
  })

  // Mapear todos os itens de despesas de todos os fornecedores
  const allExpenseItems: (FixedExpenseItemType & { supplierName: string })[] =
    []

  if (data?.data) {
    data.data.forEach((supplier: FixedExpensesType) => {
      supplier.items.forEach((item: FixedExpenseItemType) => {
        allExpenseItems.push({
          ...item,
          supplierName: supplier.name,
        })
      })
    })
  }

  const hasData = allExpenseItems.length

  const selectableItems = allExpenseItems.filter(
    (item) => item.launchStatus === EMPTY_STATUS,
  )

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const selectableIds = selectableItems.map((item) => item.id)
      setSelectedIds(selectableIds)
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectItem = (expenseId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, expenseId])
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== expenseId))
    }
  }

  const getHeaderCheckboxState = () => {
    if (selectableItems.length === 0) return false
    if (selectedIds.length === selectableItems.length) return true
    if (selectedIds.length > 0) return 'indeterminate'
    return false
  }

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const month = searchParams.month
    ? Number(searchParams.month) - 1
    : currentMonth
  const year = searchParams.year ? Number(searchParams.year) : currentYear

  const handleEditInstallments = (item: FixedExpenseItemType) => {
    setSelectedTransaction(item)
    setOpenDialog('edit-installments')
  }

  const handleOpenLaunchModal = (item: FixedExpenseItemType) => {
    setSelectedExpenseForLaunch(item)
    setIsLaunchModalOpen(true)
  }

  const handleRemoveExpense = async (payableId: string) => {
    setIsGenerating([payableId])
    try {
      const response = await deleteItemNew({
        route: `/financial/payable/${payableId}`,
      })

      if (response.success) {
        toast.success('Despesa removida com sucesso')
        queryClient.invalidateQueries()
      } else {
        toast.error(response.message || 'Erro ao remover despesa')
      }
    } catch (error) {
      toast.error('Erro ao remover despesa')
    }

    await new Promise((resolve) => setTimeout(resolve, 600))

    setIsGenerating([])
  }

  const handleGenerateTransaction = async (
    expenseIds: string[],
  ): Promise<boolean> => {
    // Para manter compatibilidade com o filtro que usa esta função
    setIsGenerating(expenseIds)

    const data = {
      scheduledExpenseIds: expenseIds,
      competenceDate: '2025-06-01',
      dueDate: '2025-06-30',
      amount: 40000,
      notes: 'Observação da movimentação',
    }

    const response = await createItemNew({
      route: '/financial/scheduled-expense/launch',
      data,
    })

    if (response.success) {
      toast.success('Lançamento realizado com sucesso')
      queryClient.invalidateQueries()
    } else {
      toast.error('Erro ao lançar despesa fixa')
    }

    await new Promise((resolve) => setTimeout(resolve, 600))

    setIsGenerating([])
    return response.success
  }

  const handleViewTransaction = (item: FixedExpenseItemType) => {
    setSelectedTransaction(item)
    setOpenDialog('transaction')
  }

  // Função para converter FixedExpenseItemType para TransactionType
  // TODO: REMOVER
  const convertToTransactionType = (
    item: FixedExpenseItemType,
    supplierName: string,
  ): TransactionListType => {
    // Usar os valores corretos do payable quando existe lançamento
    const payable = item.payables?.[0]
    const hasPayable = payable && item.launchStatus !== EMPTY_STATUS

    // Calcular a data de vencimento correta baseada no dueDay
    const calculateDueDate = (
      dueDay: number,
      month: number,
      year: number,
    ): Date => {
      return new Date(year, month, dueDay)
    }

    // Para despesas lançadas, usar a data de vencimento do installment se existir, senão calcular baseado no dueDay
    const payableInstallment = hasPayable ? payable.installments?.[0] : null
    const dueDateToUse = payableInstallment?.dueDate
      ? new Date(payableInstallment.dueDate)
      : calculateDueDate(item.dueDay, month, year)

    // Verificar se a parcela foi efetivamente paga
    const isPaid = payableInstallment?.paidDate
    const paidValue = isPaid ? (hasPayable ? payable.totalAmount : 0) : 0
    const paymentDate =
      isPaid && payableInstallment?.paidDate
        ? new Date(payableInstallment.paidDate)
        : undefined

    return {
      type: 'payable' as const,
      id: hasPayable ? payable.id : item.id,
      totalValue: hasPayable ? payable.totalValue : item.amount,
      totalPaid: paidValue,
      description: item.description,
      supplier: {
        id: item.supplierId,
        name: supplierName,
      },
      installmentsQuantity: 1,
      currentInstallment: {
        id: hasPayable ? payable.id : item.id,
        installmentNumber: 1,
        status: isPaid ? 'PAID' : ('PENDING' as const),
        paymentCondition: {
          id: '',
          name: '',
        },
        bank: {
          id: '',
          name: '',
        },
        bankAccount: {
          id: '',
          name: '',
        },
        value: hasPayable ? payable.totalValue : item.amount,
        amount: hasPayable ? payable.totalValue : item.amount,
        additionalFee: hasPayable ? payable.mainAdditionalFee : 0,
        dueDate: dueDateToUse,
        paidValue,
        paymentDate,
        compensateDate: paymentDate,
      },
      notes: hasPayable ? payable.notes : '',
      status: isPaid ? 'PAID' : ('PENDING' as const),
    }
  }

  return (
    <div className="space-y-5">
      <Topbar
        title="Despesas fixas"
        primaryCta={
          <>
            <NewFixedExpenseTriggerButton onOpenChange={setIsNewExpenseOpen} />
            <NewFixedExpense
              open={isNewExpenseOpen}
              onOpenChange={setIsNewExpenseOpen}
            />
          </>
        }
      />
      <div className="space-y-2">
        <Card>
          <TableFiltersHeader searchParams={searchParams}>
            <FixedExpensesFilter
              searchParams={searchParams}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              generateTransaction={handleGenerateTransaction}
            />
          </TableFiltersHeader>
          <CardContent>
            {isLoading ? (
              <TableSkeleton cols={6} />
            ) : hasData ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={getHeaderCheckboxState()}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Referência</TableHead>
                    <TableHead>Padrão</TableHead>
                    <TableHead>Recorrência</TableHead>
                    <TableHead>Movimentação</TableHead>
                    <TableHead>Lançado</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allExpenseItems?.map((item) => {
                    const description = `${truncateString(80, item?.description)}`
                    const isSelected = selectedIds.includes(item.id)
                    const isDisabled = item.launchStatus !== EMPTY_STATUS
                    const defaultDueDate = `${item?.dueDay}/${(month + 1).toString().padStart(2, '0')}/${year}`

                    return (
                      <TableRow key={item?.id}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            disabled={isDisabled}
                            onCheckedChange={(checked) => {
                              if (isDisabled) return
                              handleSelectItem(item.id, checked as boolean)
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{item?.supplierName}</p>
                          <p className="text-gray-600">{description}</p>
                        </TableCell>
                        <TableCell>
                          <p>{formatCurrencyToBrl(item?.amount)}</p>
                          <p className="text-gray-600">{defaultDueDate}</p>
                        </TableCell>
                        <TableCell>
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
                        <TableCell>
                          {item?.launchStatus === EMPTY_STATUS ? (
                            <Badge status variant="neutralLight">
                              Sem lançamento
                            </Badge>
                          ) : (
                            <p>{item?.description || '-'}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          <div>
                            <p>
                              {item?.payables[0]?.totalAmount
                                ? formatCurrencyToBrl(
                                    item?.payables[0]?.totalAmount,
                                  )
                                : '-'}
                            </p>
                            <p>
                              {formatToLocaleDate(item?.payables[0]?.createdAt)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <TooltipProvider>
                              {item?.launchStatus !== EMPTY_STATUS ? (
                                <>
                                  <PermissionGate
                                    permissions={[
                                      'financial:fixed_expense:view',
                                    ]}
                                  >
                                    <ActionButton
                                      Icon={IconSearch}
                                      tooltip="Visualizar"
                                      disabled={isGenerating?.includes(
                                        item?.payables?.[0]?.id,
                                      )}
                                      onClick={() =>
                                        handleViewTransaction(item)
                                      }
                                    />
                                  </PermissionGate>
                                  <PermissionGate
                                    permissions={[
                                      'financial:fixed_expense:edit',
                                    ]}
                                  >
                                    <ActionButton
                                      Icon={IconRefreshDot}
                                      tooltip="Editar"
                                      disabled={isGenerating?.includes(
                                        item?.payables?.[0]?.id,
                                      )}
                                      onClick={() =>
                                        handleEditInstallments(item)
                                      }
                                    />
                                  </PermissionGate>
                                  <PermissionGate
                                    permissions={[
                                      'financial:fixed_expense:delete',
                                    ]}
                                  >
                                    <ActionButton
                                      Icon={IconMinus}
                                      tooltip="Remover"
                                      isLoading={isGenerating?.includes(
                                        item?.payables?.[0]?.id,
                                      )}
                                      onClick={() => {
                                        handleRemoveExpense(
                                          item?.payables?.[0]?.id,
                                        )
                                      }}
                                    />
                                  </PermissionGate>
                                </>
                              ) : (
                                <PermissionGate
                                  permissions={[
                                    'financial:fixed_expense:create',
                                  ]}
                                >
                                  <ActionButton
                                    Icon={IconPlus}
                                    tooltip="Lançar"
                                    isLoading={isGenerating?.includes(item?.id)}
                                    onClick={() => handleOpenLaunchModal(item)}
                                  />
                                </PermissionGate>
                              )}
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <FilteredDataEmpty
                title="Despesas fixas não encontradas"
                description="Sua busca não encontrou nenhum resultado. Tente novamente ou cadastre uma nova despesa fixa"
              />
            )}
          </CardContent>
          {isLoading || hasData ? (
            <CardFooter>
              <TablePagination
                searchParams={searchParams}
                lastPage={data?.totalPages}
              />
            </CardFooter>
          ) : null}
        </Card>
      </div>

      <TransactionDetailsDialog
        open={openDialog === 'transaction'}
        setOpen={setOpenDialog}
        rowData={
          selectedTransaction
            ? convertToTransactionType(
                selectedTransaction,
                allExpenseItems.find(
                  (item) => item.id === selectedTransaction.id,
                )?.supplierName || '',
              )
            : undefined
        }
        type="payable"
      />

      <EditInstallments
        open={openDialog === 'edit-installments'}
        setOpen={setOpenDialog}
        rowData={
          selectedTransaction
            ? convertToTransactionType(
                selectedTransaction,
                allExpenseItems.find(
                  (item) => item.id === selectedTransaction.id,
                )?.supplierName || '',
              )
            : undefined
        }
        type="payable"
      />

      <LaunchMovementModal
        open={isLaunchModalOpen}
        onOpenChange={setIsLaunchModalOpen}
        item={selectedExpenseForLaunch}
        month={month}
        year={year}
      />
    </div>
  )
}
