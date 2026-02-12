'use client'

import * as XLSX from 'xlsx'
import type { CashFlowPdfData } from '../../pdf-types'
import { formatCurrencyToBrl } from '@/lib/utils'

export function generateCashFlowExcel(data: CashFlowPdfData) {
  const rows: (string | number)[][] = []

  // Header row
  rows.push(['Descrição', 'Contraparte', 'Vencimento', 'Tipo', 'Valor', '%'])

  data.groups.forEach((group) => {
    // Group header row
    rows.push([group.date, '', '', '', group.total, ''])

    // Group records
    group.records.forEach((record) => {
      rows.push([
        record.description,
        record.clientName,
        record.dueDate,
        record.type === 'revenue' ? 'Receita' : 'Despesa',
        record.value,
        record.percentage,
      ])
    })
  })

  // Summary rows
  rows.push([])
  rows.push(['Receitas Previstas', '', '', '', data.totalRevenue, ''])
  rows.push(['Despesas Previstas', '', '', '', data.totalExpenses, ''])
  rows.push(['Saldo Previsto', '', '', '', data.totalBalance, ''])

  const ws = XLSX.utils.aoa_to_sheet(rows)

  // Set column widths
  ws['!cols'] = [
    { wch: 35 }, // Descrição
    { wch: 25 }, // Contraparte
    { wch: 14 }, // Vencimento
    { wch: 10 }, // Tipo
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
  XLSX.utils.book_append_sheet(wb, ws, 'Projeção de Caixa')

  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const yyyy = now.getFullYear()
  const hh = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  const fileName = `projecao-de-caixa-${dd}-${mm}-${yyyy}-${hh}h${min}.xlsx`

  XLSX.writeFile(wb, fileName)
}
