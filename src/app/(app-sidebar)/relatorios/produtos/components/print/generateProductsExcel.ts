'use client'

import * as XLSX from 'xlsx'
import type { ProductsReportPdfData } from '../../pdf-types'
import { formatCurrencyToBrl } from '@/lib/utils'
import { formatUnit } from '../../utils'

// Coluna de valor (índice base 0), formatada como texto no fim
const VALUE_COL = 3

export function generateProductsExcel(data: ProductsReportPdfData) {
  const rows: (string | number)[][] = []

  rows.push([`Período: ${data.period.start} a ${data.period.end}`, '', '', ''])
  rows.push(['Produto', 'Qtd. vendida', 'Un. comercial', 'Valor total'])

  data.products.forEach((product) => {
    // Quantidade fica numérica para somar e filtrar na planilha
    rows.push([
      product.name,
      product.quantity,
      formatUnit(product.unit),
      product.value,
    ])
  })

  rows.push(['TOTAL DOS PRODUTOS NO PERÍODO', '', '', data.totalValue])

  const ws = XLSX.utils.aoa_to_sheet(rows)

  ws['!cols'] = [
    { wch: 40 }, // Produto
    { wch: 14 }, // Qtd. vendida
    { wch: 14 }, // Un. comercial
    { wch: 18 }, // Valor total
  ]

  // Format value column as currency
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
  for (let r = 1; r <= range.e.r; r++) {
    const valueCell = ws[XLSX.utils.encode_cell({ r, c: VALUE_COL })]
    if (valueCell && typeof valueCell.v === 'number') {
      valueCell.t = 's'
      valueCell.v = formatCurrencyToBrl(valueCell.v as number)
    }
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Produtos vendidos')

  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const yyyy = now.getFullYear()
  const hh = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  const fileName = `relatorio-produtos-${dd}-${mm}-${yyyy}-${hh}h${min}.xlsx`

  XLSX.writeFile(wb, fileName)
}
