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
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { UnpayInstallment } from '../UnpayInstallment'
import { TextSupportingText } from '@/components/common/TextSupportingText'

// Icons
import { IconThumbUp } from '@tabler/icons-react'

// Types
import type { InstallmentType } from '@/types/financial/financialFlow'

// Actions
import { DetailCardRowItem } from '@/app/(app-sidebar)/cadastros/clientes/[id]/components/DetailCardRowItem'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'
import { formatToLocaleDate } from '@/lib/formatDate'

interface Props {
  open: boolean
  setOpen: (value: string) => void
  rowData?: InstallmentType
  type?: 'receivable' | 'payable'
  transactionDialogOpen?: (open: boolean) => void
}

export function ViewPaymentDialog({
  type,
  open,
  rowData,
  setOpen,
  transactionDialogOpen,
}: Props) {
  const handlePrintReceipt = () => {
    window.open('/impressao', '_blank')
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen(openDialog ? 'payment' : '')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[644px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconThumbUp} />
            <DialogTitle>Pagamento</DialogTitle>
          </div>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <DetailCardRowItem className="lg:grid-cols-3 px-0">
            <TextSupportingText
              supporting="Forma de pagamento"
              text={rowData?.paymentMethod?.name}
            />
            <TextSupportingText
              supporting="Banco"
              text={rowData?.bankAccount?.name}
            />
            <TextSupportingText
              supporting="Data de pagamento"
              text={formatToLocaleDate(rowData?.paymentDate)}
            />
          </DetailCardRowItem>
          <DetailCardRowItem
            className="lg:grid-cols-3 px-0"
            showSeparator={false}
          >
            <TextSupportingText
              supporting="Data de compensação"
              text={formatToLocaleDate(rowData?.compensateDate)}
            />
            <TextSupportingText
              supporting="Valor"
              text={formatCurrencyToBrl(rowData?.value)}
            />
            <TextSupportingText
              supporting="Realizado"
              text={formatCurrencyToBrl(rowData?.paidValue || 0)}
            />
          </DetailCardRowItem>
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <div>
            {type === 'receivable' && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrintReceipt}
              >
                Imprimir recibo
              </Button>
            )}
          </div>
          <div className="space-x-4">
            <DialogClose asChild>
              <Button type="button" variant="neutralOutline">
                Voltar
              </Button>
            </DialogClose>
            <UnpayInstallment
              type={type}
              rowData={rowData}
              handleOpenChange={handleOpenChange}
              transactionDialogOpen={transactionDialogOpen}
            />
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
