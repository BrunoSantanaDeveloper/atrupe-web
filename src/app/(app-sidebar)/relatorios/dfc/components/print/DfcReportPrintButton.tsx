'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { pdf } from '@react-pdf/renderer'
import { toast } from 'sonner'

// UI
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Icons
import { IconPrinter, IconLoader2 } from '@tabler/icons-react'

// Components
import { DfcReportPdf } from './DfcReportPdf'

// Actions
import { getDfcReportPdfData } from '@/actions/dfc-report-pdf'

// Generators
import { generateDfcExcel } from './generateDfcExcel'

// Types
import type { DfcReportPdfData } from '../../pdf-types'

function getFilters(searchParams: URLSearchParams) {
  const startDate = searchParams.get('startDate') || undefined
  const endDate = searchParams.get('endDate') || undefined
  const regime =
    (searchParams.get('regime') as 'competencia' | 'realizado') || undefined

  return { startDate, endDate, regime }
}

export function DfcReportPrintButton() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  const handleGeneratePDF = async () => {
    try {
      setIsLoading(true)
      const filters = getFilters(searchParams)
      const data: DfcReportPdfData = await getDfcReportPdfData(filters)
      const blob = await pdf(<DfcReportPdf data={data} />).toBlob()
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (error) {
      toast.error(`Erro ao gerar PDF: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateExcel = async () => {
    try {
      setIsLoading(true)
      const filters = getFilters(searchParams)
      const data: DfcReportPdfData = await getDfcReportPdfData(filters)
      generateDfcExcel(data)
    } catch (error) {
      toast.error(`Erro ao gerar Excel: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="neutralOutline"
          size="iconMd"
          RightIcon={isLoading ? IconLoader2 : IconPrinter}
          disabled={isLoading}
          className={isLoading ? '[&_svg]:animate-spin' : ''}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleGeneratePDF}>PDF</DropdownMenuItem>
        <DropdownMenuItem onClick={handleGenerateExcel}>Excel</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
