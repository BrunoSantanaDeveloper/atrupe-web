'use client'

// React
import { useState } from 'react'

// Components
import { FixedExpensesFilter } from './FixedExpensesFilter'
import { Topbar } from '@/components/common/Topbar'
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { TableSkeletonRows } from '@/components/common/TableSkeleton'
import { FetchingRegion } from '@/components/common/FetchingRegion'
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
import { getData, createItemNew, deleteItemNew } from '@/actions/_cruds'
import { toast } from 'sonner'

// Libs
import { formatCurrencyToBrl, truncateString } from '@/lib/utils'
import { formatDateOnly } from '@/lib/formatDate'

// Third-party
import {
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'

// Consts
import { fixedExpensesRecurringTypeObj } from '@/consts/fixedExpenses'

// Icons
import {
  IconPlus,
  IconTrash,
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

  const { data, isLoading, isPlaceholderData } = useQuery({
    staleTime: Infinity,
    // Filtro, busca e página mantêm a lista anterior até a nova chegar
    placeholderData: keepPreviousData,
    queryKey: ['fixed-expenses-list', searchParams],
    queryFn: () =>
      getData({
        route: '/financial/scheduled-expense/grouped-by-supplier',
        filters: searchParams,
      }),
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

  // Ordenar por dia de vencimento efetivo (crescente)
  allExpenseItems.sort((a, b) => {
    const getDueDay = (item: FixedExpenseItemType) => {
      const installmentDueDate = item.payables?.[0]?.installments?.[0]?.dueDate
      if (installmentDueDate) return new Date(installmentDueDate).getDate()
      return item.dueDay
    }
    const diff = getDueDay(a) - getDueDay(b)
    if (diff !== 0) return diff
    return a.supplierName.localeCompare(b.supplierName, 'pt-BR')
  })

  const hasData = allExpenseItems.length

  // Permitir marcar o checkbox apenas as despesas não lançadas
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

  // Estado do checkbox que marca todos
  const getHeaderCheckboxState = () => {
    if (selectableItems.length === 0) return false
    if (selectedIds.length === selectableItems.length) return true
    if (selectedIds.length > 0) return 'indeterminate'
    return false
  }

  const month = Number(searchParams.month)
  const year = Number(searchParams.year)

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
      month,
      year,
    }

    const response = await createItemNew({
      route: '/financial/scheduled-expense/launch',
      data,
    })

    if (response.success) {
      toast.success('Lançamento realizado')
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

    // Para despesas lançadas, usar a data de vencimento do installment se existir, senão calcular baseado no dueDay
    const payableInstallment = hasPayable ? payable.installments?.[0] : null
    const dueDateToUse = payableInstallment?.dueDate
      ? new Date(payableInstallment.dueDate)
      : new Date(year, month, item.dueDay)

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
            <PermissionGate
              permissions={['financial_settings:fixed_expenses:create']}
            >
              <NewFixedExpenseTriggerButton
                onOpenChange={setIsNewExpenseOpen}
              />
              <NewFixedExpense
                open={isNewExpenseOpen}
                onOpenChange={setIsNewExpenseOpen}
              />
            </PermissionGate>
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
            <FetchingRegion isFetching={isPlaceholderData}>
              {isLoading || hasData ? (
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
                    {isLoading ? (
                      <TableSkeletonRows cols={7} />
                    ) : (
                      allExpenseItems?.map((item) => {
                        const description = `${truncateString(80, item?.description)}`
                        const isSelected = selectedIds.includes(item.id)
                        const isDisabled = item.launchStatus !== EMPTY_STATUS
                        const defaultDueDate = `${item?.dueDay}/${(month + 1).toString().padStart(2, '0')}/${year}`

                        const payableInstallment =
                          item?.payables[0]?.installments?.[0]

                        const realDueDate = payableInstallment?.dueDate

                        // Se estiver paga, não permite excluir
                        const canDelete = payableInstallment?.status !== 'PAID'

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
                              <p className="font-medium">
                                {item?.supplierName}
                              </p>
                              <p className="text-gray-600">{description}</p>
                            </TableCell>
                            <TableCell>
                              <p>{formatCurrencyToBrl(item?.amount)}</p>
                              <p className="text-gray-600">{defaultDueDate}</p>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  fixedExpensesRecurringTypeObj[
                                    item?.recurringType
                                  ]?.variant
                                }
                              >
                                {
                                  fixedExpensesRecurringTypeObj[
                                    item?.recurringType
                                  ]?.text
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
                            <TableCell>
                              <div>
                                <p>
                                  {item?.payables[0]?.totalAmount
                                    ? formatCurrencyToBrl(
                                        item?.payables[0]?.totalAmount,
                                      )
                                    : '-'}
                                </p>
                                <p className="text-gray">
                                  {formatDateOnly(realDueDate)}
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
                                          tooltip="Editar parcelas"
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
                                          'financial:fixed_expense:edit',
                                        ]}
                                      >
                                        <ActionButton
                                          Icon={IconTrash}
                                          variant="errorGhost"
                                          tooltip="Remover"
                                          isLoading={isGenerating?.includes(
                                            item?.payables?.[0]?.id,
                                          )}
                                          onClick={() => {
                                            if (canDelete) {
                                              handleRemoveExpense(
                                                item?.payables?.[0]?.id,
                                              )
                                            }
                                          }}
                                          disabled={!canDelete}
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
                                        isLoading={isGenerating?.includes(
                                          item?.id,
                                        )}
                                        onClick={() =>
                                          handleOpenLaunchModal(item)
                                        }
                                      />
                                    </PermissionGate>
                                  )}
                                </TooltipProvider>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              ) : (
                <FilteredDataEmpty
                  title="Despesas fixas não encontradas"
                  description="Sua busca não encontrou nenhum resultado. Tente novamente ou cadastre uma nova despesa fixa"
                />
              )}
            </FetchingRegion>
          </CardContent>
          {isLoading || hasData ? (
            <CardFooter>
              <TablePagination
                searchParams={searchParams}
                lastPage={data?.lastPage}
                isLoading={isLoading}
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

      <PermissionGate permissions={['financial:fixed_expense:create']}>
        <LaunchMovementModal
          open={isLaunchModalOpen}
          onOpenChange={setIsLaunchModalOpen}
          item={selectedExpenseForLaunch}
          month={month}
          year={year}
        />
      </PermissionGate>
    </div>
  )
}
