'use client'

import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'

// UI
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button, ButtonProps } from '@/components/ui/button'

// Icon
import { IconPrinter, IconLoader2 } from '@tabler/icons-react'

// Actions
import { getSalesReportPdfData } from '@/actions/sales-report-pdf'

// PDF Component
import { SalesReportPdf } from './SalesReportPdf'

interface SalesReportPrintButtonProps {
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
}

export function SalesReportPrintButton({
  variant = 'neutralOutline',
  size = 'iconMd',
}: SalesReportPrintButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      const filters = {
        sellerId: searchParams.get('sellerId') || undefined,
        originId: searchParams.get('originId') || undefined,
        startDate: searchParams.get('startDate') || undefined,
        endDate: searchParams.get('endDate') || undefined,
      }

      const pdfData = await getSalesReportPdfData(filters)

      if (!pdfData) {
        throw new Error('Erro ao buscar dados do PDF')
      }

      const blob = await pdf(<SalesReportPdf data={pdfData} />).toBlob()
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.error('Erro ao gerar PDF')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size={size}
          variant={variant}
          disabled={isLoading}
          RightIcon={isLoading ? IconLoader2 : IconPrinter}
          className={isLoading ? '[&_svg]:animate-spin' : ''}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-28" align="end">
        <DropdownMenuItem onClick={handleGeneratePDF} disabled={isLoading}>
          PDF
        </DropdownMenuItem>
        <DropdownMenuItem disabled>Excel</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
