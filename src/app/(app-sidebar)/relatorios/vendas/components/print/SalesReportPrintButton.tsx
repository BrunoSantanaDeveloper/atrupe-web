'use client'

import { useState } from 'react'
// EC-3: o @react-pdf/renderer não entra no topo do arquivo. Os componentes
// dele chegam como undefined na renderização do servidor e derrubam a página
// com "Element type is invalid". Biblioteca e documento são carregados dentro
// do clique que gera o PDF
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
import { IconDownload } from '@tabler/icons-react'

// Actions
import { getSalesReportPdfData } from '@/actions/sales-report-pdf'

import {
  calculatePeriodDates,
  formatDateToISO,
  type PeriodType,
} from '@/lib/filter-utils'

// Types
import type { SalesOrderBy, SalesPeriodBy } from '../../types'

// PDF Component

// Excel
import { generateSalesExcel } from './generateSalesExcel'

export function SalesReportPrintButton() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()

  const getFilters = () => {
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

    return {
      sellerId: searchParams.get('sellerId') || undefined,
      originId: searchParams.get('originId') || undefined,
      clientId: searchParams.get('clientId') || undefined,
      serieId: searchParams.get('serieId') || undefined,
      groupBy:
        (searchParams.get('groupBy') as 'none' | 'client' | 'seller') ||
        undefined,
      orderBy: (searchParams.get('orderBy') as SalesOrderBy) || undefined,
      periodBy: (searchParams.get('periodBy') as SalesPeriodBy) || undefined,
      startDate,
      endDate,
    }
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      const filters = getFilters()
      const pdfData = await getSalesReportPdfData(filters)

      if (!pdfData) {
        throw new Error('Erro ao buscar dados do PDF')
      }

      const [{ pdf }, { SalesReportPdf }] = await Promise.all([
        import('@react-pdf/renderer'),

        import('./SalesReportPdf'),
      ])

      const blob = await pdf(
        <SalesReportPdf data={pdfData} groupBy={filters.groupBy} />,
      ).toBlob()
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.error('Erro ao gerar PDF')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateExcel = async () => {
    setIsLoading(true)
    try {
      const filters = getFilters()
      const data = await getSalesReportPdfData(filters)

      if (!data) {
        throw new Error('Erro ao buscar dados')
      }

      generateSalesExcel(data, filters.groupBy)
    } catch (error) {
      console.error('Erro ao gerar Excel:', error)
      toast.error('Erro ao gerar Excel')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="md"
          variant="neutralOutline"
          isLoading={isLoading}
          LeftIcon={IconDownload}
        >
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-28" align="end">
        <DropdownMenuItem onClick={handleGeneratePDF} disabled={isLoading}>
          PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleGenerateExcel} disabled={isLoading}>
          Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
