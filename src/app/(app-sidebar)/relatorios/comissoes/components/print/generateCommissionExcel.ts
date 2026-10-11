'use client'

import * as XLSX from 'xlsx'
import type { CommissionPdfData } from '../../pdf-types'
import { formatCurrencyToBrl } from '@/lib/utils'
import {
  commissionOf,
  commissionModeCopy,
  type CommissionMode,
} from '../../mode'

export function generateCommissionExcel(
  data: CommissionPdfData,
  mode: CommissionMode,
) {
  const groupCommission = (group: CommissionPdfData['groups'][0]) =>
    group.records.reduce((sum, r) => sum + commissionOf(r, mode), 0)

  const rows: (string | number)[][] = []

  // Header row
  rows.push([
    'Serviços',
    'Descrição',
    'Data da venda',
    'Data do recebimento',
    'Venda',
    'Recebimento',
    '%',
    `Comissão (${commissionModeCopy[mode].label.toLowerCase()})`,
  ])

  data.groups.forEach((group) => {
    // Group header row
    rows.push([
      group.vendedorName,
      `${group.count} registros`,
      '',
      '',
      group.saleTotal,
      group.receivedTotal,
      '',
      groupCommission(group),
    ])

    // Group records
    group.records.forEach((record) => {
      rows.push([
        record.clientName,
        record.description,
        record.saleDate,
        record.receivedDate,
        record.saleValue,
        record.receivedValue,
        record.percentage,
        commissionOf(record, mode),
      ])
    })
  })

  // Total row
  rows.push([
    'TOTAL',
    '',
    '',
    '',
    data.totalSaleValue,
    data.totalReceivedValue,
    '',
    data.groups.reduce((sum, group) => sum + groupCommission(group), 0),
  ])

  const ws = XLSX.utils.aoa_to_sheet(rows)

  // Set column widths
  ws['!cols'] = [
    { wch: 30 }, // Serviços
    { wch: 35 }, // Descrição
    { wch: 16 }, // Data da venda
    { wch: 18 }, // Data do recebimento
    { wch: 18 }, // Venda
    { wch: 18 }, // Recebimento
    { wch: 10 }, // %
    { wch: 18 }, // Comissão
  ]

  // Format value columns as currency and percentage column
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
  for (let r = 1; r <= range.e.r; r++) {
    // Venda column (index 4)
    const saleCell = ws[XLSX.utils.encode_cell({ r, c: 4 })]
    if (saleCell && typeof saleCell.v === 'number') {
      saleCell.t = 's'
      saleCell.v = formatCurrencyToBrl(saleCell.v as number)
    }
    // Recebimento column (index 5)
    const receivedCell = ws[XLSX.utils.encode_cell({ r, c: 5 })]
    if (receivedCell && typeof receivedCell.v === 'number') {
      receivedCell.t = 's'
      receivedCell.v = formatCurrencyToBrl(receivedCell.v as number)
    }
    // Comissão column (index 7)
    const commissionCell = ws[XLSX.utils.encode_cell({ r, c: 7 })]
    if (commissionCell && typeof commissionCell.v === 'number') {
      commissionCell.t = 's'
      commissionCell.v = formatCurrencyToBrl(commissionCell.v as number)
    }
    // % column (index 6)
    const pctCell = ws[XLSX.utils.encode_cell({ r, c: 6 })]
    if (pctCell && typeof pctCell.v === 'number') {
      pctCell.t = 's'
      pctCell.v = `${pctCell.v}%`
    }
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Comissões')

  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const yyyy = now.getFullYear()
  const hh = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  const fileName = `relatorio-comissoes-${dd}-${mm}-${yyyy}-${hh}h${min}.xlsx`

  XLSX.writeFile(wb, fileName)
}
