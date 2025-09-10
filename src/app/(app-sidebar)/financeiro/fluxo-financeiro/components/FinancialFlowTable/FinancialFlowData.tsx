'use client'

// React
import { Fragment, useState } from 'react'

// Components
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { TablePagination } from '@/components/common/TablePagination'
import { FilteredDataEmpty } from '@/components/common/TableEmptyState'
import { PaymentDialog } from '@/app/(app-sidebar)/financeiro/_components/transactions/Actions/Payment'
import { TransacionNotesDialog } from '@/app/(app-sidebar)/financeiro/_components/transactions/Actions/Notes'
import { CompensateDialog } from '@/app/(app-sidebar)/financeiro/_components/transactions/Actions/Compensate'
import { ViewPaymentDialog } from '@/app/(app-sidebar)/financeiro/_components/transactions/Actions/ViewPayment'
import { TransactionHistoryDialog } from '@/app/(app-sidebar)/financeiro/_components/transactions/Actions/History'
import { EditInstallments } from '@/app/(app-sidebar)/financeiro/_components/transactions/Actions/EditInstallments'
import { TransactionDetailsDialog } from '@/app/(app-sidebar)/financeiro/_components/transactions/Actions/TransactionDetails'

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
import type { SearchParamsType } from '@/types/coreTypes'
import type {
  InstallmentType,
  TransactionDataType,
  TransactionListType,
} from '@/types/financial/financialFlow'

// Actions
import { getData } from '@/actions/_cruds'

// Libs
import { formatToWeekDate } from '@/lib/formatDate'
import { cn, formatCurrencyToBrl } from '@/lib/utils'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import {
  IconSearch,
  IconMessage,
  IconHistory,
  IconTrendingUp,
  IconRefreshDot,
  IconTrendingDown,
} from '@tabler/icons-react'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Consts
import { transactionStatus } from '@/consts/receivables'
import { Badge } from '@/components/ui/badge'

interface Props extends SearchParamsType {
  showTotals: boolean
}

export function FinancialFlowData({ searchParams, showTotals }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<TransactionListType>()
  const [installment, setInstallment] = useState<InstallmentType>()

  const filters = { ...searchParams }

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['financial-flow-list', searchParams],
    queryFn: () => getData({ route: '/financial/flow', filters }),
  })

  const transactionData: TransactionDataType[] = data?.data || []
  const hasData = transactionData.length

  console.log(transactionData)

  return (
    <>
      <CardContent>
        {isLoading ? (
          <TableSkeleton />
        ) : hasData ? (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="max-w-96">Referência</TableHead>
                  <TableHead></TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Realizado</TableHead>
                  <TableHead>Forma de pagamento</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionData.map((group) => (
                  <Fragment key={group.date}>
                    <TableRow className="bg-gray-100 max-h-11">
                      <TableCell colSpan={6} className="py-1 pr-1">
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-gray text-xs">
                            {formatToWeekDate(group?.date)}
                          </p>
                          <div
                            className={cn(
                              'flex gap-1 transition-all duration-500',
                              showTotals
                                ? 'opacity-100 max-h-14'
                                : 'opacity-0 max-h-9',
                            )}
                          >
                            <div className="flex items-center gap-5 p-1.5 pr-2 rounded-lg bg-success-25">
                              <div className="flex items-center gap-2">
                                <FeaturedIcon
                                  variant="successLight"
                                  Icon={IconTrendingUp}
                                />
                                <div className="flex gap-4">
                                  <div>
                                    <p className="text-xs text-gray">
                                      Receita prevista
                                    </p>
                                    <p className="text-sm font-semibold ">
                                      {formatCurrencyToBrl(
                                        group?.expectedRevenue,
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray">
                                      Receita realizada
                                    </p>
                                    <p className="text-sm font-semibold text-success-700">
                                      {formatCurrencyToBrl(
                                        group?.realizedRevenue,
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-5 p-1.5 pr-2 rounded-lg bg-error-25">
                              <div className="flex items-center gap-2">
                                <FeaturedIcon
                                  variant="errorLight"
                                  Icon={IconTrendingDown}
                                />
                                <div className="flex gap-4">
                                  <div>
                                    <p className="text-xs text-gray">
                                      Despesa prevista
                                    </p>
                                    <p className="text-sm font-semibold ">
                                      {formatCurrencyToBrl(
                                        group?.expectedExpense,
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray">
                                      Despesa realizada
                                    </p>
                                    <p className="text-sm font-semibold text-error-700">
                                      {formatCurrencyToBrl(
                                        group?.realizedExpense,
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                    {group?.transactions?.length
                      ? group?.transactions.map((item) => {
                          const currentInstallment = item?.currentInstallment
                          const editDisabled =
                            item?.expenseSource === 'EMPLOYEE'

                          return (
                            <TableRow key={item?.id} className="text-nowrap">
                              <TableCell className="max-w-96">
                                <p className="font-medium">
                                  {item?.client?.name ||
                                    item?.supplier?.name ||
                                    item?.employee?.name}
                                </p>
                                <div className="flex gap-2">
                                  {item?.status === 'CANCELED' && (
                                    <Badge size="sm" variant="errorLight">
                                      Cancelado
                                    </Badge>
                                  )}
                                  <p className="text-gray truncate">
                                    {item?.description}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-600">
                                {`${currentInstallment?.installmentNumber} / ${item?.installmentsQuantity}`}
                              </TableCell>
                              <TableCell
                                className={cn(
                                  item?.type === 'receivable'
                                    ? 'text-success-700'
                                    : 'text-error-700',
                                )}
                              >
                                {formatCurrencyToBrl(currentInstallment?.value)}
                              </TableCell>
                              <TableCell>
                                {formatCurrencyToBrl(
                                  currentInstallment?.paidValue,
                                )}
                              </TableCell>
                              <TableCell>
                                <p className="font-medium">
                                  {currentInstallment?.bankAccount?.name}
                                </p>
                                <p className="text-gray">
                                  {currentInstallment?.paymentMethod?.name ||
                                    '-'}
                                </p>
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-1">
                                  <TooltipProvider>
                                    <PermissionGate
                                      permissions={['financial:flow:view']}
                                    >
                                      <ActionButton
                                        Icon={IconSearch}
                                        tooltip={
                                          item?.status === 'CANCELED'
                                            ? 'Movimentação cancelada'
                                            : 'Detalhes da movimentação'
                                        }
                                        onClick={() => {
                                          setRowData(item)
                                          setOpenDialog('transaction')
                                        }}
                                        badge={
                                          item?.status === 'CANCELED'
                                            ? 'errorLight'
                                            : undefined
                                        }
                                      />
                                    </PermissionGate>

                                    <PermissionGate
                                      permissions={[
                                        item?.type === 'receivable'
                                          ? 'financial:flow_receivable:edit'
                                          : 'financial:flow_payable:edit',
                                      ]}
                                    >
                                      <ActionButton
                                        Icon={IconRefreshDot}
                                        tooltip="Editar parcelas"
                                        onClick={() => {
                                          if (editDisabled) return
                                          setRowData(item)
                                          setOpenDialog('edit-installments')
                                        }}
                                        disabled={editDisabled}
                                      />
                                    </PermissionGate>

                                    <PermissionGate
                                      permissions={['financial:flow:view']}
                                    >
                                      <ActionButton
                                        Icon={IconMessage}
                                        tooltip={
                                          item?.notes
                                            ? 'Possui observação'
                                            : 'Observações'
                                        }
                                        onClick={() => {
                                          setRowData(item)
                                          setOpenDialog('notes')
                                        }}
                                        badge={
                                          item?.notes
                                            ? 'warningLight'
                                            : undefined
                                        }
                                      />
                                      <ActionButton
                                        Icon={IconHistory}
                                        tooltip="Histórico"
                                        onClick={() => {
                                          setRowData(item)
                                          setOpenDialog('history')
                                        }}
                                      />
                                    </PermissionGate>

                                    <PermissionGate
                                      permissions={[
                                        item?.type === 'receivable'
                                          ? 'financial:flow_receivable:edit'
                                          : 'financial:flow_payable:edit',
                                      ]}
                                    >
                                      <ActionButton
                                        Icon={
                                          transactionStatus[
                                            currentInstallment?.status ||
                                              'UNKNOWN'
                                          ]?.icon
                                        }
                                        tooltip={
                                          transactionStatus[
                                            currentInstallment?.status ||
                                              'UNKNOWN'
                                          ]?.tooltip
                                        }
                                        variant={
                                          transactionStatus[
                                            currentInstallment?.status ||
                                              'UNKNOWN'
                                          ]?.button
                                        }
                                        onClick={() => {
                                          if (
                                            currentInstallment?.status ===
                                            'CANCELED'
                                          )
                                            return

                                          setRowData(item)
                                          setInstallment(currentInstallment)

                                          switch (currentInstallment?.status) {
                                            case 'PENDING':
                                              setOpenDialog('payment')
                                              break
                                            case 'PROVISIONED':
                                              setOpenDialog('compensate')
                                              break
                                            case 'PAID':
                                              setOpenDialog('view')
                                              break
                                            case 'OVERDUE':
                                              setOpenDialog('payment')
                                              break
                                            default:
                                              setOpenDialog('')
                                              break
                                          }
                                        }}
                                        disabled={item?.status === 'CANCELED'}
                                      />
                                    </PermissionGate>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      : null}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
            <TransacionNotesDialog
              open={openDialog === 'notes'}
              setOpen={setOpenDialog}
              rowData={rowData}
              type={rowData?.type}
            />
            <TransactionDetailsDialog
              open={openDialog === 'transaction'}
              setOpen={setOpenDialog}
              rowData={rowData}
              type={rowData?.type}
            />
            <EditInstallments
              open={openDialog === 'edit-installments'}
              setOpen={setOpenDialog}
              rowData={rowData}
              type={rowData?.type}
            />
            <TransactionHistoryDialog
              open={openDialog === 'history'}
              setOpen={setOpenDialog}
              rowData={rowData}
            />
            <PaymentDialog
              open={openDialog === 'payment'}
              setOpen={setOpenDialog}
              rowData={installment}
              transactionData={rowData}
              type={rowData?.type}
            />
            <CompensateDialog
              open={openDialog === 'compensate'}
              setOpen={setOpenDialog}
              rowData={installment}
              transactionData={rowData}
              type={rowData?.type}
            />
            <ViewPaymentDialog
              open={openDialog === 'view'}
              setOpen={setOpenDialog}
              rowData={installment}
              transactionData={rowData}
              type={rowData?.type}
            />
          </>
        ) : (
          <FilteredDataEmpty
            title="Nada encontrado"
            description="Sua busca não encontrou nenhum resultado."
          />
        )}
      </CardContent>
      {isLoading || hasData ? (
        <CardFooter>
          <TablePagination
            searchParams={searchParams}
            lastPage={data?.lastPage}
          />
        </CardFooter>
      ) : null}
    </>
  )
}
