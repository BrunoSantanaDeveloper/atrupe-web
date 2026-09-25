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

// Mode
import { commissionFilters, commissionModeOf } from '../../mode'

// PDF Component

// Excel
import { generateCommissionExcel } from './generateCommissionExcel'

export function CommissionReportPrintButton() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()

  // As mesmas datas e o mesmo modo da tela, inclusive o vendedor filtrado:
  // antes a impressão saía com todos os vendedores
  const getFilters = () =>
    commissionFilters({
      commissionType: searchParams.get('commissionType'),
      period: searchParams.get('period'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      sellerId: searchParams.get('sellerId'),
    })

  const mode = commissionModeOf(searchParams.get('commissionType'))

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

      const blob = await pdf(
        <CommissionReportPdf data={pdfData} mode={mode} />,
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
      const data = await getCommissionPdfData(getFilters())

      if (!data) {
        throw new Error('Erro ao buscar dados')
      }

      generateCommissionExcel(data, mode)
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
