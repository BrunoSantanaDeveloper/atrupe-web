'use client'

import * as XLSX from 'xlsx'
import type { FinancialPdfData } from '../../pdf-types'
import { formatCurrencyToBrl } from '@/lib/utils'

const STATUS_LABELS: Record<string, string> = {
  received: 'Recebidas',
  confirmed: 'Confirmadas',
  to_receive: 'A receber',
  overdue: 'Vencidas',
}

export function generateFinancialExcel(data: FinancialPdfData) {
  const isReceitas = data.tab !== 'despesas'
  const rows: (string | number)[][] = []

  // Header row
  rows.push([
    'Descrição',
    isReceitas ? 'Cliente' : 'Fornecedor',
    'Data',
    'Status',
    'Valor',
    '%',
  ])

  data.groups.forEach((group) => {
    // Group header row
    rows.push([group.clientName, '', '', '', group.total, group.percentage])

    // Group records
    group.records.forEach((record) => {
      rows.push([
        record.description,
        record.clientName,
        record.receivedDate || record.dueDate || '',
        STATUS_LABELS[record.status] || record.status,
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
    { wch: 35 }, // Descrição
    { wch: 25 }, // Cliente/Fornecedor
    { wch: 14 }, // Data
    { wch: 14 }, // Status
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
  XLSX.utils.book_append_sheet(wb, ws, isReceitas ? 'Receitas' : 'Despesas')

  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const yyyy = now.getFullYear()
  const hh = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  const type = isReceitas ? 'receitas' : 'despesas'
  const fileName = `relatorio-financeiro-${type}-${dd}-${mm}-${yyyy}-${hh}h${min}.xlsx`

  XLSX.writeFile(wb, fileName)
}
