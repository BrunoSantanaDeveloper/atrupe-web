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

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'
import { exportToXlsx } from '@/lib/export-excel'
import {
  calculatePeriodDates,
  formatDateToISO,
  type PeriodType,
} from '@/lib/filter-utils'

// PDF Component

interface RankingItem {
  name: string
  value: number
}

interface RankingPrintButtonProps {
  title: string
  nameLabel: string
  items: RankingItem[]
}

export function RankingPrintButton({
  title,
  nameLabel,
  items,
}: RankingPrintButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()

  const getPeriodFilters = () => {
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

    return { startDate, endDate }
  }

  const handleGeneratePDF = async () => {
    if (!items.length) {
      toast.error('Nenhum dado disponível para exportar')
      return
    }

    setIsLoading(true)
    try {
      const reportData = await getSalesReportPdfData(getPeriodFilters())

      const [{ pdf }, { RankingReportPdf }] = await Promise.all([
        import('@react-pdf/renderer'),

        import('./RankingReportPdf'),
      ])

      const blob = await pdf(
        <RankingReportPdf
          company={reportData?.company}
          title={title}
          nameLabel={nameLabel}
          items={items}
        />,
      ).toBlob()

      window.open(URL.createObjectURL(blob), '_blank')
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.error('Erro ao gerar PDF')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateExcel = () => {
    if (!items.length) {
      toast.error('Nenhum dado disponível para exportar')
      return
    }

    try {
      exportToXlsx({
        fileName: title,
        sheetName: title.slice(0, 31),
        data: items,
        columns: [
          { header: '#', width: 6, getValue: (_, index) => index + 1 },
          { header: nameLabel, key: 'name', width: 40 },
          {
            header: 'Valor',
            width: 18,
            getValue: (row) => formatCurrencyToBrl(row.value),
          },
        ],
      })
    } catch (error) {
      console.error('Erro ao gerar Excel:', error)
      toast.error('Erro ao gerar Excel')
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
