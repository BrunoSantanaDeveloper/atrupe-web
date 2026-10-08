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
import { BulkPrintReceiptButton } from '@/app/(app-sidebar)/financeiro/_components/transactions/Actions/BulkPrintReceiptButton'

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
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'

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
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'

// Icons
import {
  IconX,
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

type SelectedInstallment = {
  installmentId: string
  clientKey: string
  clientName: string
}

export function FinancialFlowData({ searchParams, showTotals }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<TransactionListType>()
  const [installment, setInstallment] = useState<InstallmentType>()
  const [isLoadingPayment, setIsLoadingPayment] = useState(false)
  const [selectedInstallments, setSelectedInstallments] = useState<
    SelectedInstallment[]
  >([])

  const hasUrlDateParams = searchParams?.startDate && searchParams?.endDate

  const filters = { ...searchParams }

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['financial-flow-list', searchParams],
    queryFn: () => getData({ route: '/financial/flow', filters }),
  })

  const transactionData: TransactionDataType[] = data?.data || []
  const hasData = transactionData.length

  const triggerPaymentLoading = () => {
    setIsLoadingPayment(true)
    setTimeout(() => {
      setIsLoadingPayment(false)
    }, 2000)
  }

  const toggleInstallment = (item: TransactionListType) => {
    const installmentId = item.currentInstallment?.id
    if (!installmentId || item.type !== 'receivable') return

    const clientKey =
      item.client?.cnpj?.replace(/\D/g, '') ||
      item.client?.cpf?.replace(/\D/g, '') ||
      ''

    if (!clientKey) {
      toast.error('Cliente sem CPF/CNPJ para agrupar recibo')
      return
    }

    const isSelected = selectedInstallments.some(
      (selected) => selected.installmentId === installmentId,
    )

    if (isSelected) {
      setSelectedInstallments((prev) =>
        prev.filter((selected) => selected.installmentId !== installmentId),
      )
      return
    }

    if (
      selectedInstallments.length > 0 &&
      selectedInstallments[0].clientKey !== clientKey
    ) {
      toast.error('Selecione parcelas do mesmo CPF/CNPJ')
      return
    }

    setSelectedInstallments((prev) => [
      ...prev,
      {
        installmentId,
        clientKey,
        clientName: item.client?.name || '',
      },
    ])
  }

  return (
    <>
      <CardContent>
        {isLoading || !hasUrlDateParams ? (
          <TableSkeleton />
        ) : hasData ? (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-10" />
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
                      <TableCell colSpan={7} className="py-1 pr-1">
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
                                  tone="success"
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
                                  tone="error"
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
                            item?.expenseSource === 'EMPLOYEE' // TODO: incluir na página de receitas e despesas

                          return (
                            <TableRow key={item?.id} className="text-nowrap">
                              <TableCell className="w-10">
                                {item?.type === 'receivable' ? (
                                  <Checkbox
                                    checked={selectedInstallments.some(
                                      (selected) =>
                                        selected.installmentId ===
                                        currentInstallment?.id,
                                    )}
                                    onCheckedChange={() =>
                                      toggleInstallment(item)
                                    }
                                    disabled={item?.status === 'CANCELED'}
                                  />
                                ) : null}
                              </TableCell>
                              <TableCell className="max-w-96">
                                <p className="font-medium">
                                  {item?.client?.name ||
                                    item?.supplier?.name ||
                                    item?.employee?.name}
                                </p>
                                <div className="flex gap-2 flex-wrap items-center">
                                  {item?.status === 'CANCELED' && (
                                    <Badge size="sm" variant="errorLight">
                                      Cancelado
                                    </Badge>
                                  )}
                                  {item?.invoiceType &&
                                    item.invoiceType !== 'OTHER' && (
                                      <Badge size="sm" variant="blueLight">
                                        {item.invoiceType === 'NFE'
                                          ? 'NF-e'
                                          : 'NFS-e'}
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
                                  {currentInstallment?.paymentCondition?.name ||
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
                                        'financial:flow:edit',
                                        item?.type === 'receivable'
                                          ? 'financial:receivable:edit'
                                          : 'financial:payable:edit',
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
                                        'financial:flow:edit',
                                        item?.type === 'receivable'
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
                                        isLoading={isLoadingPayment}
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
            {selectedInstallments.length > 0 && (
              <div className="sticky bottom-0 mt-2 flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">
                    {selectedInstallments.length} parcela(s)
                  </span>{' '}
                  selecionada(s)
                  {selectedInstallments[0].clientName
                    ? ` · ${selectedInstallments[0].clientName}`
                    : ''}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="neutralOutline"
                    LeftIcon={IconX}
                    onClick={() => setSelectedInstallments([])}
                  >
                    Limpar
                  </Button>
                  <BulkPrintReceiptButton
                    installmentIds={selectedInstallments.map(
                      (selected) => selected.installmentId,
                    )}
                    onSuccess={() => setSelectedInstallments([])}
                  />
                </div>
              </div>
            )}
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
              triggerLoading={triggerPaymentLoading}
            />
            <CompensateDialog
              open={openDialog === 'compensate'}
              setOpen={setOpenDialog}
              rowData={installment}
              transactionData={rowData}
              type={rowData?.type}
              triggerLoading={triggerPaymentLoading}
            />
            <ViewPaymentDialog
              open={openDialog === 'view'}
              setOpen={setOpenDialog}
              rowData={installment}
              transactionData={rowData}
              type={rowData?.type}
              triggerLoading={triggerPaymentLoading}
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
