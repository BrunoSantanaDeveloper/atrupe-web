// React
import { useState } from 'react'

// UI
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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

// Icons
import { IconCircleCheck } from '@tabler/icons-react'

// Components
import { ReceiptPdf } from './Payment/ReceiptPdf'

// Types
import type { ReceiptPdfType } from '@/types/financial/receipt'

// Actions
import { getItem } from '@/actions/_cruds'

// Lib
import { pdf } from '@react-pdf/renderer'

interface PrintReceiptButtonProps {
  type?: 'receivable' | 'payable'
  installmentId?: string
  paidDate?: Date | null
  paidAmount?: number | null
  variant?: 'outline' | 'default' | 'neutralOutline'
  className?: string
}

export function PrintReceiptButton({
  type,
  installmentId,
  paidDate,
  paidAmount,
  variant = 'outline',
  className,
}: PrintReceiptButtonProps) {
  const [isLoadingPDF, setIsLoadingPDF] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [showSignature, setShowSignature] = useState(true)

  const handlePrintReceipt = async () => {
    if (!installmentId || !type) return

    setIsLoadingPDF(true)
    setShowOptions(false)
    try {
      const route = `/financial/${type}/installment/${installmentId}/receipt-data`
      const params = new URLSearchParams()
      if (paidDate) params.append('paidDate', paidDate.toISOString())
      if (paidAmount !== undefined && paidAmount !== null)
        params.append('paidAmount', paidAmount.toString())

      const queryString = params.toString() ? `?${params.toString()}` : ''

      const result = await getItem({
        route: `${route}${queryString}`,
      })

      if (!result.success) {
        throw new Error(result.message)
      }

      const pdfData: ReceiptPdfType = result.data
      const blob = await pdf(
        <ReceiptPdf data={pdfData} showSignature={showSignature} />,
      ).toBlob()

      const url = URL.createObjectURL(blob)

      window.open(url, '_blank')
    } catch (error) {
      toast.error('Erro ao gerar recibo')
      console.error('Erro ao gerar recibo:', error)
    } finally {
      setIsLoadingPDF(false)
    }
  }

  // Só mostra o botão para recebimentos
  if (type !== 'receivable') return null

  return (
    <>
      <Dialog
        open={showOptions}
        onOpenChange={isLoadingPDF ? undefined : setShowOptions}
      >
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Opções de impressão</DialogTitle>
            <DialogDescription className="sr-only">
              Imprimir recibo
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="flex items-center gap-3">
              <Checkbox
                id="receipt-show-signature"
                checked={showSignature}
                onCheckedChange={(v) => setShowSignature(!!v)}
              />
              <Label htmlFor="receipt-show-signature">
                Exibir assinatura digital
              </Label>
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="neutralOutline"
                disabled={isLoadingPDF}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="button"
              RightIcon={IconCircleCheck}
              isLoading={isLoadingPDF}
              onClick={handlePrintReceipt}
            >
              Imprimir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button
        type="button"
        variant={variant}
        onClick={() => setShowOptions(true)}
        disabled={isLoadingPDF}
        className={className}
      >
        Imprimir recibo
      </Button>
    </>
  )
}
