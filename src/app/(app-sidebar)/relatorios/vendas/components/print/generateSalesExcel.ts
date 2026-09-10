'use client'

import * as XLSX from 'xlsx'
import type { SalesReportPdfData } from '../../pdf-types'
import { formatCurrencyToBrl } from '@/lib/utils'

// Colunas de valor e % (índices base 0), formatadas como texto no fim
const VALUE_COL = 7
const PERCENT_COL = 8

export function generateSalesExcel(
  data: SalesReportPdfData,
  groupBy?: 'none' | 'client' | 'seller',
) {
  const rows: (string | number)[][] = []

  // Header row — cliente e cidade em todas as linhas, para filtrar na planilha
  rows.push([
    'O.S.',
    'Cliente',
    'Cidade',
    'Serviço',
    'Aprovado',
    'Data de entrega',
    'Fase atual',
    'Valor',
    '%',
  ])

  const totalSuffix =
    groupBy === 'client'
      ? ' (Total do Cliente)'
      : groupBy === 'seller'
        ? ' (Total do Vendedor)'
        : ''

  data.groups.forEach((group) => {
    // Group header row
    rows.push([
      `${group.clientName}${totalSuffix}`,
      '',
      '',
      '',
      '',
      '',
      '',
      group.total,
      group.percentage,
    ])

    // Group records
    group.records.forEach((record) => {
      rows.push([
        record.osNumber,
        record.clientName,
        record.clientCity || '',
        record.description,
        record.approvedDate || '',
        record.deliveryDate || '',
        record.phase,
        record.value,
        record.percentage,
      ])
    })
  })

  // Total row
  rows.push([
    'TOTAL',
    '',
    '',
    '',
    '',
    '',
    '',
    data.totalValue,
    data.totalPercentage,
  ])

  const ws = XLSX.utils.aoa_to_sheet(rows)

  // Set column widths
  ws['!cols'] = [
    { wch: 12 }, // O.S.
    { wch: 30 }, // Cliente
    { wch: 20 }, // Cidade
    { wch: 40 }, // Serviço
    { wch: 12 }, // Aprovado
    { wch: 16 }, // Data de entrega
    { wch: 16 }, // Fase atual
    { wch: 18 }, // Valor
    { wch: 8 }, // %
  ]

  // Format value column as currency and percentage column
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
  for (let r = 1; r <= range.e.r; r++) {
    const valueCell = ws[XLSX.utils.encode_cell({ r, c: VALUE_COL })]
    if (valueCell && typeof valueCell.v === 'number') {
      valueCell.t = 's'
      valueCell.v = formatCurrencyToBrl(valueCell.v as number)
    }
    const pctCell = ws[XLSX.utils.encode_cell({ r, c: PERCENT_COL })]
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
