import * as XLSX from 'xlsx'
import type { DfcReportPdfData, DfcPdfTableRow } from '../../pdf-types'

export function generateDfcExcel(data: DfcReportPdfData) {
  const { table, summary } = data
  const rows: (string | number)[][] = []

  // Header row
  rows.push(['Categoria', ...table.headers])

  // Data rows (flattened, with code prefix)
  const indent = (level: number) => '  '.repeat(level)

  table.rows.forEach((row: DfcPdfTableRow) => {
    const label = `${indent(row.level)}${row.code ? `${row.code} - ` : ''}${row.name}`
    const values = table.headers.map((h) => row.values[h] || 0)
    rows.push([label, ...values])
  })

  // Blank row + summary
  rows.push([])
  rows.push(['Receitas Totais', summary.totalRevenue])
  rows.push(['Despesas Totais', summary.totalExpenses])
  rows.push(['Fluxo de Caixa Final', summary.finalCashFlow])

  const ws = XLSX.utils.aoa_to_sheet(rows)

  // Column widths
  ws['!cols'] = [{ wch: 40 }, ...table.headers.map(() => ({ wch: 15 }))]

  // Format value columns as currency
  const valueStartCol = 1
  for (let r = 1; r < rows.length; r++) {
    for (let c = valueStartCol; c <= table.headers.length; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c })
      if (ws[cellRef] && typeof ws[cellRef].v === 'number') {
        ws[cellRef].z = '#,##0.00'
      }
    }
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'DFC')

  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const fileName = `dfc-${day}-${month}-${year}-${hours}h${minutes}.xlsx`

  XLSX.writeFile(wb, fileName)
}
