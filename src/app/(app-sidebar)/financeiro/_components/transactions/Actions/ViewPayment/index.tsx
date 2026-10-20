// UI
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// Components
import { UnpayInstallment } from '../UnpayInstallment'
import { PrintReceiptButton } from '../PrintReceiptButton'
import { TextSupportingText } from '@/components/common/TextSupportingText'

// Icons

// Types
import type {
  InstallmentType,
  TransactionListType,
} from '@/types/financial/financialFlow'

// Actions
import { DetailCardRowItem } from '@/app/(app-sidebar)/cadastros/clientes/[id]/components/DetailCardRowItem'

// Utils
import { formatDateOnly } from '@/lib/formatDate'
import { formatCurrencyToBrl } from '@/lib/utils'
import { PermissionGate } from '@/components/common/PermissionGate'

interface Props {
  open: boolean
  setOpen: (value: string) => void
  rowData?: InstallmentType
  transactionData?: TransactionListType
  type?: 'receivable' | 'payable'
  transactionDialogOpen?: (open: boolean) => void
  triggerLoading?: () => void
}

export function ViewPaymentDialog({
  type,
  open,
  rowData,
  transactionData,
  setOpen,
  transactionDialogOpen,
  triggerLoading,
}: Props) {
  const handleOpenChange = (openDialog: boolean) => {
    setOpen(openDialog ? 'payment' : '')
  }

  const typeText = type === 'payable' ? 'pagamento' : 'recebimento'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[644px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4 capitalize">{typeText}</div>
          </DialogTitle>
          <DialogDescription className="sr-only"></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <DetailCardRowItem className="lg:grid-cols-3 px-0">
            {type === 'receivable' ? (
              <TextSupportingText
                supporting="Cliente"
                text={transactionData?.client?.name}
              />
            ) : (
              <TextSupportingText
                supporting="Fornecedor"
                text={
                  transactionData?.supplier?.name ||
                  transactionData?.employee?.name
                }
              />
            )}
            <TextSupportingText
              containerClassName="lg:col-span-2"
              supporting="Descrição"
              text={transactionData?.description}
            />
          </DetailCardRowItem>
          <DetailCardRowItem className="lg:grid-cols-3 px-0">
            <TextSupportingText
              supporting={`Forma de ${typeText}`}
              text={rowData?.paymentCondition?.name}
            />
            <TextSupportingText
              supporting="Banco"
              text={rowData?.bankAccount?.name}
            />
            <TextSupportingText
              supporting={`Data de ${typeText}`}
              text={formatDateOnly(rowData?.paymentDate || rowData?.paidDate)}
            />
          </DetailCardRowItem>
          <DetailCardRowItem
            className="lg:grid-cols-3 px-0"
            showSeparator={false}
          >
            <TextSupportingText
              supporting="Data de compensação"
              text={formatDateOnly(
                rowData?.compensateDate || rowData?.paidDate,
              )}
            />
            <TextSupportingText
              supporting="Valor"
              text={formatCurrencyToBrl(rowData?.value || rowData?.amount)}
            />
            <TextSupportingText
              supporting="Realizado"
              text={formatCurrencyToBrl(
                rowData?.paidValue ?? rowData?.paidAmount ?? 0,
              )}
            />
          </DetailCardRowItem>
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <div>
            <PrintReceiptButton
              type={type}
              installmentId={rowData?.id}
              paidDate={
                rowData?.paymentDate
                  ? new Date(rowData.paymentDate)
                  : rowData?.paidDate
                    ? new Date(rowData.paidDate)
                    : undefined
              }
              paidAmount={
                rowData?.paidValue ?? rowData?.paidAmount ?? rowData?.amount
              }
            />
          </div>
          <div className="space-x-4">
            <DialogClose asChild>
              <Button type="button" variant="neutralOutline">
                Voltar
              </Button>
            </DialogClose>

            <PermissionGate permissions={['financial:flow:edit']}>
              <UnpayInstallment
                type={type}
                rowData={rowData}
                handleOpenChange={handleOpenChange}
                transactionDialogOpen={transactionDialogOpen}
                triggerLoading={triggerLoading}
              />
            </PermissionGate>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
