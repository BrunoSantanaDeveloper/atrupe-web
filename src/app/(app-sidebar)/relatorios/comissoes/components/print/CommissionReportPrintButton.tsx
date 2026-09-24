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
import { IconPrinter } from '@tabler/icons-react'

// Actions
import { getCommissionPdfData } from '@/actions/commission-report-pdf'

import {
  calculatePeriodDates,
  formatDateToISO,
  type PeriodType,
} from '@/lib/filter-utils'

// Types
import type { CommissionType } from '../../types'

// PDF Component

// Excel
import { generateCommissionExcel } from './generateCommissionExcel'

export function CommissionReportPrintButton() {
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
      commissionType:
        (searchParams.get('commissionType') as CommissionType) || undefined,
      startDate,
      endDate,
    }
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      const pdfData = await getCommissionPdfData(getFilters())

      if (!pdfData) {
        throw new Error('Erro ao buscar dados do PDF')
      }

      const [{ pdf }, { CommissionReportPdf }] = await Promise.all([
        import('@react-pdf/renderer'),

        import('./CommissionReportPdf'),
      ])

      const blob = await pdf(<CommissionReportPdf data={pdfData} />).toBlob()
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
      const data = await getCommissionPdfData(getFilters())

      if (!data) {
        throw new Error('Erro ao buscar dados')
      }

      generateCommissionExcel(data)
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
        <DropdownMenuItem onClick={handleGenerateExcel} disabled={isLoading}>
          Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
