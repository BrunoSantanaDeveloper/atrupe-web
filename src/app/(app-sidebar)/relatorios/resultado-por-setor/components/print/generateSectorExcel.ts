'use client'

import * as XLSX from 'xlsx'
import type { SectorReportPdfData } from '../../pdf-types'
import { formatCurrencyToBrl } from '@/lib/utils'

export function generateSectorExcel(data: SectorReportPdfData) {
  const rows: (string | number)[][] = []

  // Header row
  rows.push(['Setor', 'Resultado'])

  // Sector rows
  data.sectors.forEach((sector) => {
    rows.push([sector.name, sector.value])
  })

  // Total row
  rows.push(['TOTAL GERAL', data.generalTotal])

  const ws = XLSX.utils.aoa_to_sheet(rows)

  // Set column widths
  ws['!cols'] = [
    { wch: 35 }, // Setor
    { wch: 20 }, // Resultado
  ]

  // Format value column as currency
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
  for (let r = 1; r <= range.e.r; r++) {
    const valueCell = ws[XLSX.utils.encode_cell({ r, c: 1 })]
    if (valueCell && typeof valueCell.v === 'number') {
      valueCell.t = 's'
      valueCell.v = formatCurrencyToBrl(valueCell.v as number)
    }
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Resultados por Setor')

  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const yyyy = now.getFullYear()
  const hh = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  const fileName = `resultado-por-setor-${dd}-${mm}-${yyyy}-${hh}h${min}.xlsx`

  XLSX.writeFile(wb, fileName)
}
