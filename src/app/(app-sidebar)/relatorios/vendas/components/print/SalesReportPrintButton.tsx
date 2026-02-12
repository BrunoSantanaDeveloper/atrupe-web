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
import { Button } from '@/components/ui/button'

// Icon
import { IconPrinter } from '@tabler/icons-react'

// Actions
import { getSalesReportPdfData } from '@/actions/sales-report-pdf'

import {
  calculatePeriodDates,
  formatDateToISO,
  type PeriodType,
} from '@/lib/filter-utils'

// PDF Component
import { SalesReportPdf } from './SalesReportPdf'

export function SalesReportPrintButton() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      // Apply default dates (current month) when URL has none
      let startDate = searchParams.get('startDate') || undefined
      let endDate = searchParams.get('endDate') || undefined

      if (!startDate || !endDate) {
        const period = (searchParams.get('period') ||
          'current_month') as PeriodType
        const dates = calculatePeriodDates(period)
        if (dates) {
          startDate = formatDateToISO(dates.startDate)
          endDate = formatDateToISO(dates.endDate)
        }
      }

      const filters = {
        sellerId: searchParams.get('sellerId') || undefined,
        originId: searchParams.get('originId') || undefined,
        startDate,
        endDate,
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
          size="iconMd"
          variant="neutralOutline"
          isLoading={isLoading}
          RightIcon={IconPrinter}
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
