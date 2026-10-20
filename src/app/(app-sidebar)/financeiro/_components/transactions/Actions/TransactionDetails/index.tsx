// React
import { useState } from 'react'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'

// Components
import { PaymentDialog } from '../Payment'
import { CompensateDialog } from '../Compensate'
import { ViewPaymentDialog } from '../ViewPayment'
import { CancelAlertDialog } from './CancelTransaction/Alert'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeletonRows } from '@/components/common/TableSkeleton'
import { EditTransactionData } from './EditTransaction/EditData'
import { TextSupportingText } from '@/components/common/TextSupportingText'
import { PermissionGate } from '@/components/common/PermissionGate'
import { DetailCardRowItem } from '@/app/(app-sidebar)/cadastros/clientes/[id]/components/DetailCardRowItem'

// Icons

// Types
import {
  InstallmentType,
  TransactionListType,
  TransactionDetailsType,
} from '@/types/financial/financialFlow'

// Lib
import { formatDateOnly } from '@/lib/formatDate'
import { cn, formatCurrencyToBrl } from '@/lib/utils'

// Consts
import { transactionStatus } from '@/consts/receivables'

import { getItem, createItemNew } from '@/actions/_cruds'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAlertDialog } from '@/store/useAlertDialog'

interface Props {
  open: boolean
  setOpen: (value: string) => void
  rowData?: TransactionListType
  type?: 'receivable' | 'payable'
}

export function TransactionDetailsDialog({
  open,
  type,
  setOpen,
  rowData,
}: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [installment, setInstallment] = useState<InstallmentType>()
  const queryClient = useQueryClient()
  const alertDialog = useAlertDialog()

  const { data: installmentData, isLoading: isLoadingInstallment } = useQuery({
    queryKey: ['installment-details', rowData?.id],
    queryFn: () =>
      getItem({
        route: `/financial/${type}/${rowData?.id}`,
      }),
    enabled: !!rowData?.id,
  })

  const handleOpenChange = (openDialog: boolean) => {
    setOpen(openDialog ? 'transaction' : '')
  }

  const handleUndoCancel = async () => {
    if (!rowData?.id || !type) return

    await alertDialog.open({
      title: 'Desfazer cancelamento',
      description:
        'Tem certeza que deseja desfazer o cancelamento desta movimentação?',
      confirmLabel: 'Desfazer cancelamento',
      cancelLabel: 'Cancelar',
      confirmVariant: 'default',
      onConfirm: async () => {
        const result = await createItemNew({
          route: `/financial/${type}/${rowData.id}/undo-cancel`,
        })

        if (result.success) {
          queryClient.invalidateQueries()
          handleOpenChange(false)
        }
      },
    })
  }

  const data: TransactionDetailsType = installmentData?.data

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <span>Movimentação</span>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only"></DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <DetailCardRowItem className="lg:grid-cols-3 px-0">
            {type === 'receivable' ? (
              <TextSupportingText
                supporting="Cliente"
                text={rowData?.client?.name}
              />
            ) : (
              <TextSupportingText
                supporting={
                  rowData?.expenseSource === 'EMPLOYEE'
                    ? 'Colaborador'
                    : 'Fornecedor'
                }
                text={rowData?.supplier?.name || rowData?.employee?.name}
              />
            )}
            <TextSupportingText
              supporting="Descrição"
              text={rowData?.description}
            />
            <TextSupportingText
              supporting="Tipo de NF"
              text={
                data?.invoiceType === 'NFE'
                  ? 'NF-e (Produto)'
                  : data?.invoiceType === 'NFSE'
                    ? 'NFS-e (Serviço)'
                    : data?.invoiceType === 'OTHER'
                      ? 'A definir'
                      : '-'
              }
            />
          </DetailCardRowItem>
          <DetailCardRowItem
            className="lg:grid-cols-3 px-0"
            showSeparator={false}
          >
            <TextSupportingText
              supporting="Natureza"
              text={data?.nature?.description}
            />
            <TextSupportingText
              supporting="Categoria"
              text={data?.subCategory?.description}
            />
            <TextSupportingText
              supporting="Competência"
              text={formatDateOnly(data?.referenceDate)}
            />
          </DetailCardRowItem>
          <div className=" rounded-xl border border-gray-300 max-h-[338px] overflow-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="min-w-64">Forma de pagamento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Realizado</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {isLoadingInstallment ? (
                  <TableSkeletonRows cols={5} rows={3} />
                ) : (
                  data?.installments?.map((item) => {
                    const isCurrent =
                      item.id === rowData?.currentInstallment?.id

                    return (
                      <TableRow
                        key={item?.id}
                        className={cn(isCurrent && 'bg-gray-100')}
                      >
                        <TableCell
                          className={cn(
                            'text-gray-600',
                            isCurrent && 'font-medium text-gray-900',
                          )}
                        >
                          {item?.paymentCondition?.name}{' '}
                          {item?.installmentNumber}/{data?.installmentQty}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p
                              className={cn(
                                type === 'receivable'
                                  ? 'text-success-700'
                                  : 'text-error-700',
                              )}
                            >
                              {formatCurrencyToBrl(item?.amount)}
                            </p>
                            <p className="text-gray">
                              {formatDateOnly(item?.dueDate)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>
                              {formatCurrencyToBrl(
                                item?.paidValue || item?.paidAmount,
                              )}
                            </p>
                            <p className="text-gray">
                              {formatDateOnly(
                                item?.paymentDate || item?.paidDate,
                              )}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={transactionStatus[item?.status]?.badge}
                            status
                          >
                            {transactionStatus[item?.status]?.text}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <PermissionGate
                              permissions={[
                                'financial:flow:edit',
                                type === 'receivable'
                                  ? 'financial:receivable:edit'
                                  : 'financial:payable:edit',
                              ]}
                            >
                              <ActionButton
                                Icon={transactionStatus[item?.status]?.icon}
                                tooltip={
                                  transactionStatus[item?.status || 'UNKNOWN']
                                    ?.tooltip
                                }
                                variant={
                                  transactionStatus[item?.status || 'UNKNOWN']
                                    ?.button
                                }
                                onClick={() => {
                                  if (rowData?.status === 'CANCELED') return

                                  setInstallment(item)

                                  switch (item?.status) {
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
                                disabled={rowData?.status === 'CANCELED'}
                              />
                            </PermissionGate>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <div className="flex gap-6">
            <div>
              <p className="text-lg font-semibold text-gray-500">
                {formatCurrencyToBrl(rowData?.totalValue)}
              </p>
              <p className="text-sm font-medium text-gray-400">Valor total</p>
            </div>
            <div>
              <p className="text-lg font-semibold">
                {formatCurrencyToBrl(rowData?.currentInstallment?.value)}
              </p>
              <p className="text-sm font-medium text-gray-700">
                Valor da movimentação
              </p>
            </div>
          </div>
          <div className="space-x-4">
            <Button
              type="button"
              variant="neutralOutline"
              onClick={() => handleOpenChange(false)}
              autoFocus
            >
              Voltar
            </Button>
            {rowData?.status === 'CANCELED' && (
              <PermissionGate
                permissions={[
                  type === 'receivable'
                    ? 'financial:receivable:edit'
                    : 'financial:payable:edit',
                ]}
              >
                <Button type="button" onClick={handleUndoCancel}>
                  Desfazer cancelamento
                </Button>
              </PermissionGate>
            )}
            {open && rowData?.status !== 'CANCELED' && (
              <>
                <PermissionGate
                  permissions={[
                    'financial:flow:delete',
                    type === 'receivable'
                      ? 'financial:receivable:delete'
                      : 'financial:payable:delete',
                  ]}
                >
                  <CancelAlertDialog
                    rowData={data}
                    type={type}
                    onTransactionCancel={() => handleOpenChange(false)}
                  />
                </PermissionGate>
                <PermissionGate
                  permissions={[
                    'financial:flow:edit',
                    type === 'receivable'
                      ? 'financial:receivable:edit'
                      : 'financial:payable:edit',
                  ]}
                >
                  <EditTransactionData
                    rowData={data}
                    type={type}
                    transactionDialogOpen={handleOpenChange}
                  />
                </PermissionGate>
                <PaymentDialog
                  open={openDialog === 'payment'}
                  setOpen={setOpenDialog}
                  rowData={installment}
                  transactionData={rowData}
                  type={type}
                  transactionDialogOpen={handleOpenChange}
                />
                <CompensateDialog
                  open={openDialog === 'compensate'}
                  setOpen={setOpenDialog}
                  rowData={installment}
                  transactionData={rowData}
                  type={type}
                  transactionDialogOpen={handleOpenChange}
                />
                <ViewPaymentDialog
                  open={openDialog === 'view'}
                  setOpen={setOpenDialog}
                  rowData={installment}
                  transactionData={rowData}
                  type={type}
                  transactionDialogOpen={handleOpenChange}
                />
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
