'use client'

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
import { IconCircleCheck, IconPrinter } from '@tabler/icons-react'

// Components

// Types
import type { ReceiptPdfType } from '@/types/financial/receipt'

// Actions
import { getItem } from '@/actions/_cruds'

// Lib
// EC-3: o @react-pdf/renderer não entra no topo do arquivo. Os componentes
// dele chegam como undefined na renderização do servidor e derrubam a página
// com "Element type is invalid". Biblioteca e documento são carregados dentro
// do clique que gera o PDF

interface Props {
  installmentIds: string[]
  onSuccess?: () => void
}

export function BulkPrintReceiptButton({ installmentIds, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [showSignature, setShowSignature] = useState(true)

  const handlePrint = async () => {
    setIsLoading(true)
    setShowOptions(false)
    try {
      const qs = installmentIds
        .map((id) => `installmentIds=${encodeURIComponent(id)}`)
        .join('&')

      const result = await getItem({
        route: `/financial/receivable/batch-receipt-data?${qs}`,
      })

      if (!result.success) {
        throw new Error(result.message)
      }

      const pdfData: ReceiptPdfType = result.data
      const [{ pdf }, { ReceiptPdf }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./Payment/ReceiptPdf'),
      ])

      const blob = await pdf(
        <ReceiptPdf data={pdfData} showSignature={showSignature} />,
      ).toBlob()

      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      onSuccess?.()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao gerar recibo',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Dialog
        open={showOptions}
        onOpenChange={isLoading ? undefined : setShowOptions}
      >
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Opções de impressão</DialogTitle>
            <DialogDescription className="sr-only">
              Imprimir recibo de {installmentIds.length} parcela(s)
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="flex items-center gap-3">
              <Checkbox
                id="bulk-receipt-show-signature"
                checked={showSignature}
                onCheckedChange={(v) => setShowSignature(!!v)}
              />
              <Label htmlFor="bulk-receipt-show-signature">
                Exibir assinatura digital
              </Label>
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="neutralOutline"
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="button"
              RightIcon={IconCircleCheck}
              isLoading={isLoading}
              onClick={handlePrint}
            >
              Imprimir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button
        type="button"
        size="sm"
        LeftIcon={IconPrinter}
        onClick={() => setShowOptions(true)}
        disabled={isLoading}
      >
        Imprimir recibo ({installmentIds.length})
      </Button>
    </>
  )
}
