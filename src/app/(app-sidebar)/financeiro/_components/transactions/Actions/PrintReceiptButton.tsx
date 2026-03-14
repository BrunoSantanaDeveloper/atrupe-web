// React
import { useState } from 'react'

// UI
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

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

  const handlePrintReceipt = async () => {
    if (!installmentId || !type) return

    setIsLoadingPDF(true)
    try {
      // Buscar dados do PDF da API
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
      const blob = await pdf(<ReceiptPdf data={pdfData} />).toBlob()

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
    <Button
      type="button"
      variant={variant}
      onClick={handlePrintReceipt}
      isLoading={isLoadingPDF}
      disabled={isLoadingPDF}
      className={className}
    >
      Imprimir recibo
    </Button>
  )
}
