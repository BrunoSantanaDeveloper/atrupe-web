'use client'

import * as XLSX from 'xlsx'
import type { SalesReportPdfData } from '../../pdf-types'
import { formatCurrencyToBrl } from '@/lib/utils'

export function generateSalesExcel(data: SalesReportPdfData) {
  const rows: (string | number)[][] = []

  // Header row
  rows.push(['Serviços', 'Código', 'Aprovado', 'Fase atual', 'Valor', '%'])

  data.groups.forEach((group) => {
    // Group header row (bold via styling later)
    rows.push([group.clientName, '', '', '', group.total, group.percentage])

    // Group records
    group.records.forEach((record) => {
      rows.push([
        record.clientName,
        `${record.serviceCode} - ${record.description}`,
        record.approvedDate || '',
        record.phase,
        record.value,
        record.percentage,
      ])
    })
  })

  // Total row
  rows.push(['TOTAL', '', '', '', data.totalValue, data.totalPercentage])

  const ws = XLSX.utils.aoa_to_sheet(rows)

  // Set column widths
  ws['!cols'] = [
    { wch: 30 }, // Serviços
    { wch: 35 }, // Código
    { wch: 14 }, // Aprovado
    { wch: 16 }, // Fase atual
    { wch: 18 }, // Valor
    { wch: 10 }, // %
  ]

  // Format value column as currency and percentage column
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
  for (let r = 1; r <= range.e.r; r++) {
    const valueCell = ws[XLSX.utils.encode_cell({ r, c: 4 })]
    if (valueCell && typeof valueCell.v === 'number') {
      valueCell.t = 's'
      valueCell.v = formatCurrencyToBrl(valueCell.v as number)
    }
    const pctCell = ws[XLSX.utils.encode_cell({ r, c: 5 })]
    if (pctCell && typeof pctCell.v === 'number') {
      pctCell.t = 's'
      pctCell.v = `${pctCell.v}%`
    }
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Vendas')

  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const yyyy = now.getFullYear()
  const hh = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  const fileName = `relatorio-vendas-${dd}-${mm}-${yyyy}-${hh}h${min}.xlsx`

  XLSX.writeFile(wb, fileName)
}
