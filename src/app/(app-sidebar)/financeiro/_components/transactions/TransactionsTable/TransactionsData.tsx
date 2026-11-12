'use client'

// React
import { Fragment, useState } from 'react'

// Components
import { CompensateDialog } from '../Actions/Compensate'
import { ViewPaymentDialog } from '../Actions/ViewPayment'
import { TransactionHistoryDialog } from '../Actions/History'
import { EditInstallments } from '../Actions/EditInstallments'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeletonRows } from '@/components/common/TableSkeleton'
import { FetchingRegion } from '@/components/common/FetchingRegion'
import { TablePagination } from '@/components/common/TablePagination'
import { FilteredDataEmpty } from '@/components/common/TableEmptyState'
import { PermissionGate } from '@/components/common/PermissionGate'
import { NewTransaction } from '@/app/(app-sidebar)/financeiro/_components/transactions/NewTransaction'
import { PaymentDialog } from '@/app/(app-sidebar)/financeiro/_components/transactions/Actions/Payment'
import { TransacionNotesDialog } from '@/app/(app-sidebar)/financeiro/_components/transactions/Actions/Notes'
import { TransactionDetailsDialog } from '@/app/(app-sidebar)/financeiro/_components/transactions/Actions/TransactionDetails'
import { BulkPrintReceiptButton } from '../Actions/BulkPrintReceiptButton'

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
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PendencyBadge } from '@/components/common/PendencyBadge'

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
import { toast } from 'sonner'
import { useQuery, keepPreviousData } from '@tanstack/react-query'

// Icons
import {
  IconX,
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

type SelectedInstallment = {
  installmentId: string
  clientKey: string
  clientName: string
}

export function TransactionsData({ type, searchParams }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<TransactionListType>()
  const [installment, setInstallment] = useState<InstallmentType>()
  const [selectedInstallments, setSelectedInstallments] = useState<
    SelectedInstallment[]
  >([])

  const toggleInstallment = (item: TransactionListType) => {
    const installmentId = item.currentInstallment?.id
    if (!installmentId) return
    const clientKey =
      item.client?.cnpj?.replace(/\D/g, '') ||
      item.client?.cpf?.replace(/\D/g, '') ||
      ''

    if (!clientKey) {
      toast.error('Cliente sem CPF/CNPJ para agrupar recibo')
      return
    }

    const isSelected = selectedInstallments.some(
      (s) => s.installmentId === installmentId,
    )

    if (isSelected) {
      setSelectedInstallments((prev) =>
        prev.filter((s) => s.installmentId !== installmentId),
      )
      return
    }

    if (selectedInstallments.length > 0) {
      const firstClientKey = selectedInstallments[0].clientKey
      if (clientKey !== firstClientKey) {
        toast.error('Selecione parcelas do mesmo CPF/CNPJ')
        return
      }
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

  const typePt = type === 'receivable' ? 'Receita' : 'Despesa'

  const filters = { ...searchParams }

  const { data, isLoading, isPlaceholderData } = useQuery({
    staleTime: Infinity,
    // Filtro, busca e página mantêm a lista anterior até a nova chegar
    placeholderData: keepPreviousData,
    queryKey: ['transaction-list', type, searchParams],
    queryFn: () => getData({ route: `/financial/${type}`, filters }),
  })

  const transactionData: TransactionDataType[] = data?.data || []
  const hasData = transactionData.length

  const createPermission =
    type === 'receivable'
      ? 'financial:receivable:create'
      : 'financial:payable:create'

  return (
    <>
      <CardContent>
        <FetchingRegion isFetching={isPlaceholderData}>
          {isLoading || hasData ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    {type === 'receivable' && <TableHead className="w-10" />}
                    <TableHead className="min-w-64">Referência</TableHead>
                    <TableHead></TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Forma de pagamento</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableSkeletonRows cols={type === 'receivable' ? 6 : 5} />
                  ) : (
                    transactionData.map((group) => (
                      <Fragment key={group.date}>
                        <TableRow className="bg-gray-100">
                          <TableCell
                            colSpan={type === 'receivable' ? 6 : 5}
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
                                    tone={
                                      type === 'receivable'
                                        ? 'success'
                                        : 'error'
                                    }
                                    size="sm"
                                    Icon={
                                      type === 'receivable'
                                        ? IconTrendingUp
                                        : IconTrendingDown
                                    }
                                  />
                                  <p>Previsto</p>
                                </div>
                                <p className="text-sm font-semibold ">
                                  {/* O expectedRevenue da API já deixa a
                                      movimentação cancelada de fora: descontar
                                      de novo dava o dobro (EC-12, CR-1) */}
                                  {formatCurrencyToBrl(group?.expectedRevenue)}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                        {group?.transactions?.length
                          ? group?.transactions.map((item) => {
                              const description = `${truncateString(80, item?.description)}`
                              const currentInstallment =
                                item?.currentInstallment
                              const editDisabled =
                                item?.expenseSource === 'EMPLOYEE'

                              return (
                                <TableRow key={item?.id}>
                                  {type === 'receivable' && (
                                    <TableCell className="w-10">
                                      <Checkbox
                                        checked={selectedInstallments.some(
                                          (s) =>
                                            s.installmentId ===
                                            currentInstallment?.id,
                                        )}
                                        onCheckedChange={() =>
                                          toggleInstallment(item)
                                        }
                                        disabled={item?.status === 'CANCELED'}
                                      />
                                    </TableCell>
                                  )}
                                  <TableCell>
                                    <p className="font-medium">
                                      {item?.client?.name ||
                                        item?.supplier?.name ||
                                        item?.employee?.name}
                                    </p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {item?.invoiceType &&
                                        item.invoiceType !== 'OTHER' && (
                                          <Badge size="sm" variant="blueLight">
                                            {item.invoiceType === 'NFE'
                                              ? 'NF-e'
                                              : 'NFS-e'}
                                          </Badge>
                                        )}
                                      <PendencyBadge
                                        pendency={item?.pendency}
                                        clientName={item?.client?.name}
                                      />
                                      <p className="text-gray">{description}</p>
                                    </div>
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
                                    {formatCurrencyToBrl(
                                      currentInstallment?.value,
                                    )}
                                  </TableCell>
                                  <TableCell className="text-gray-600">
                                    {currentInstallment?.paymentCondition?.name}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex justify-end gap-1">
                                      <TooltipProvider>
                                        {/* A baixa é a ação mais usada: vem primeiro */}
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

                                              switch (
                                                currentInstallment?.status
                                              ) {
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
                                            disabled={
                                              item?.status === 'CANCELED'
                                            }
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
                                            gesto="ver"
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
                                              if (editDisabled) return

                                              setRowData(item)
                                              setOpenDialog('edit-installments')
                                            }}
                                            disabled={editDisabled}
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
                                      </TooltipProvider>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            })
                          : null}
                      </Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
              {type === 'receivable' && selectedInstallments.length > 0 && (
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
                        (s) => s.installmentId,
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
                transactionData={rowData}
                type={type}
              />
              <ViewPaymentDialog
                open={openDialog === 'view'}
                setOpen={setOpenDialog}
                transactionData={rowData}
                rowData={installment}
                type={type}
              />
            </>
          ) : (
            <FilteredDataEmpty
              title={`${typePt} não encontrada`}
              description={`Sua busca não encontrou nenhum resultado. Tente novamente ou cadastre uma nova ${typePt}`}
              cta={
                <PermissionGate
                  permissions={[createPermission, 'financial:flow:create']}
                >
                  <NewTransaction type={type} searchParams={searchParams} />
                </PermissionGate>
              }
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
    </>
  )
}
