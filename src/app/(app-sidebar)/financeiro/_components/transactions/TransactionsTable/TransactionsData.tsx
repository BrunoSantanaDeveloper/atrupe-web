'use client'

// React
import { Fragment, useState } from 'react'

// Components
import { CompensateDialog } from '../Actions/Compensate'
import { ViewPaymentDialog } from '../Actions/ViewPayment'
import { TransactionHistoryDialog } from '../Actions/History'
import { EditInstallments } from '../Actions/EditInstallments'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { TablePagination } from '@/components/common/TablePagination'
import { FilteredDataEmpty } from '@/components/common/TableEmptyState'
import { PermissionGate } from '@/components/common/PermissionGate'
import { NewTransaction } from '@/app/(app-sidebar)/financeiro/_components/transactions/NewTransaction'
import { PaymentDialog } from '@/app/(app-sidebar)/financeiro/_components/transactions/Actions/Payment'
import { TransacionNotesDialog } from '@/app/(app-sidebar)/financeiro/_components/transactions/Actions/Notes'
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
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { CardFooter, CardContent } from '@/components/ui/card'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type {
  InstallmentType,
  TransactionListType,
} from '@/types/financial/financialFlow'

// Actions
import { getData } from '@/actions/_cruds'

// Libs
import { formatToWeekDate } from '@/lib/formatDate'
import { cn, formatCurrencyToBrl, truncateString } from '@/lib/utils'

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

// Consts
import { transactionStatus } from '@/consts/receivables'
import { TransactionDataType } from '@/types/financial/financialFlow'

interface Props extends SearchParamsType {
  type: 'receivable' | 'payable'
}

export function TransactionsData({ type, searchParams }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<TransactionListType>()
  const [installment, setInstallment] = useState<InstallmentType>()

  const typePt = type === 'receivable' ? 'Receita' : 'Despesa'

  const filters = { ...searchParams }

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['transaction-list', type, searchParams],
    queryFn: () => getData({ route: `/financial/${type}`, filters }),
  })

  const transactionData: TransactionDataType[] = data?.data || []
  const hasData = transactionData.length

  return (
    <>
      <CardContent>
        {isLoading ? (
          <TableSkeleton cols={6} />
        ) : hasData ? (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="min-w-64">Referência</TableHead>
                  <TableHead></TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Forma de pagamento</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionData.map((group) => (
                  <Fragment key={group.date}>
                    <TableRow className="bg-gray-100">
                      <TableCell
                        colSpan={6}
                        className="text-gray font-medium text-xs py-1 pr-1"
                      >
                        <div className="flex justify-between items-center">
                          <p>{formatToWeekDate(group?.date)}</p>
                          <div
                            className={cn(
                              'flex items-center gap-5 p-1.5 pr-2 rounded-lg',
                              type === 'receivable'
                                ? 'bg-success-200 text-success-900'
                                : 'bg-error-200 text-error-900',
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <FeaturedIcon
                                variant={
                                  type === 'receivable'
                                    ? 'successLight'
                                    : 'errorLight'
                                }
                                size="xs"
                                Icon={
                                  type === 'receivable'
                                    ? IconTrendingUp
                                    : IconTrendingDown
                                }
                              />
                              <p>Previsto</p>
                            </div>
                            <p className="text-sm font-semibold ">
                              {formatCurrencyToBrl(group?.expectedRevenue)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                    {group?.transactions?.length
                      ? group?.transactions.map((item) => {
                          const description = `${truncateString(80, item?.description)}`
                          const currentInstallment = item?.currentInstallment

                          return (
                            <TableRow key={item?.id}>
                              <TableCell>
                                <p className="font-medium">
                                  {item?.client?.name || item?.supplier?.name}
                                </p>
                                <p className="text-gray">{description}</p>
                              </TableCell>
                              <TableCell className="text-gray-600">
                                {`${currentInstallment?.installmentNumber} / ${item?.installmentsQuantity}`}
                              </TableCell>
                              <TableCell
                                className={cn(
                                  type === 'receivable'
                                    ? 'text-success-700'
                                    : 'text-error-700',
                                )}
                              >
                                {formatCurrencyToBrl(currentInstallment?.value)}
                              </TableCell>
                              <TableCell className="text-gray-600">
                                {currentInstallment?.paymentMethod?.name}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-1">
                                  <TooltipProvider>
                                    <PermissionGate
                                      permissions={[
                                        type === 'receivable'
                                          ? 'financial:receivable:view'
                                          : 'financial:payable:view',
                                      ]}
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
                                        type === 'receivable'
                                          ? 'financial:receivable:edit'
                                          : 'financial:payable:edit',
                                      ]}
                                    >
                                      <ActionButton
                                        Icon={IconRefreshDot}
                                        tooltip="Editar parcelas"
                                        onClick={() => {
                                          setRowData(item)
                                          setOpenDialog('edit-installments')
                                        }}
                                      />
                                    </PermissionGate>
                                    <PermissionGate
                                      permissions={[
                                        type === 'receivable'
                                          ? 'financial:receivable:view'
                                          : 'financial:payable:view',
                                      ]}
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
                                        type === 'receivable'
                                          ? 'financial:receivable:edit'
                                          : 'financial:payable:edit',
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
              type={type}
            />
            <TransactionDetailsDialog
              open={openDialog === 'transaction'}
              setOpen={setOpenDialog}
              rowData={rowData}
              type={type}
            />
            <EditInstallments
              open={openDialog === 'edit-installments'}
              setOpen={setOpenDialog}
              rowData={rowData}
              type={type}
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
              type={type}
            />
            <CompensateDialog
              open={openDialog === 'compensate'}
              setOpen={setOpenDialog}
              rowData={installment}
              type={type}
            />
            <ViewPaymentDialog
              open={openDialog === 'view'}
              setOpen={setOpenDialog}
              rowData={installment}
              type={type}
            />
          </>
        ) : (
          <FilteredDataEmpty
            title={`${typePt} não encontrada`}
            description={`Sua busca não encontrou nenhum resultado. Tente novamente ou cadastre uma nova ${typePt}`}
            cta={<NewTransaction type={type} searchParams={searchParams} />}
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
