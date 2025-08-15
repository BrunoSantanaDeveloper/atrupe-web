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
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { PaymentDialog } from '../Payment'
import { CompensateDialog } from '../Compensate'
import { ViewPaymentDialog } from '../ViewPayment'
import { CancelAlertDialog } from './CancelTransaction/Alert'
import { ActionButton } from '@/components/common/ActionButton'
import { EditTransactionData } from './EditTransaction/EditData'
import { TextSupportingText } from '@/components/common/TextSupportingText'
import { DetailCardRowItem } from '@/app/(app-sidebar)/cadastros/clientes/[id]/components/DetailCardRowItem'

// Icons
import { IconCoin } from '@tabler/icons-react'

// Types
import {
  InstallmentType,
  TransactionListType,
  TransactionDetailsType,
} from '@/types/financial/financialFlow'

// Lib
import { formatToLocaleDate } from '@/lib/formatDate'
import { cn, formatCurrencyToBrl, truncateString } from '@/lib/utils'

// Consts
import { transactionStatus } from '@/consts/receivables'

import { getItem, createItemNew } from '@/actions/_cruds'
import { useQuery, useQueryClient } from '@tanstack/react-query'

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

    try {
      const result = await createItemNew({
        route: `/financial/${type}/${rowData.id}/undo-cancel`,
      })

      if (result.success) {
        queryClient.invalidateQueries()
        handleOpenChange(false)
      }
    } catch (error) {
      console.error('Erro ao desfazer cancelamento:', error)
    }
  }

  const data: TransactionDetailsType = installmentData?.data

  const description = `${rowData?.client?.name || rowData?.supplier?.name} - ${truncateString(40, rowData?.description)}`

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconCoin} />
            <div>
              <DialogTitle className="mb-1">Movimentação</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </div>
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
                supporting="Fornecedor"
                text={rowData?.supplier?.name}
              />
            )}
            <TextSupportingText
              supporting="Descrição"
              text={truncateString(30, rowData?.description)}
            />
            <TextSupportingText supporting="Tipo de NF" text={''} />
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
              text={formatToLocaleDate(data?.referenceDate)}
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
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      <p>Carregando...</p>
                    </TableCell>
                  </TableRow>
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
                          {item?.paymentMethod?.name} {item?.installmentNumber}/
                          {data?.installmentQty}
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
                              {formatToLocaleDate(item?.dueDate)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{formatCurrencyToBrl(item?.paidValue)}</p>
                            <p className="text-gray">
                              {formatToLocaleDate(item?.paymentDate)}
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
            {rowData?.status === 'CANCELED' && false && (
              <Button type="button" onClick={handleUndoCancel}>
                Desfazer cancelamento
              </Button>
            )}
            {open && rowData?.status !== 'CANCELED' && (
              <>
                <CancelAlertDialog rowData={data} type={type} />
                <EditTransactionData
                  rowData={data}
                  type={type}
                  transactionDialogOpen={handleOpenChange}
                />
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
