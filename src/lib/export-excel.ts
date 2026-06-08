import * as XLSX from 'xlsx'

export type ExportFormat = 'xlsx' | 'csv'

export type ExportCellValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined

export type ExportColumnType =
  | 'text'
  | 'number'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'percent'

export interface ExportColumn<T> {
  header: string
  key?: keyof T
  width?: number
  type?: ExportColumnType
  getValue?: (row: T, index: number) => ExportCellValue
  format?: (value: ExportCellValue, row: T, index: number) => string | number
}

export interface ExportSheetConfig<T> {
  columns: ExportColumn<T>[]
  data: T[]
  fileName: string
  sheetName?: string
}

interface BuildFileNameOptions {
  extension: ExportFormat
  includeTimestamp?: boolean
}

const CSV_DELIMITER = ';'
const CSV_BOM = '\uFEFF'

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function getTimestamp() {
  const now = new Date()

  return [
    pad(now.getDate()),
    pad(now.getMonth() + 1),
    now.getFullYear(),
    `${pad(now.getHours())}h${pad(now.getMinutes())}`,
  ].join('-')
}

export function buildExportFileName(
  baseName: string,
  { extension, includeTimestamp = true }: BuildFileNameOptions,
) {
  const safeBaseName = baseName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()

  const suffix = includeTimestamp ? `-${getTimestamp()}` : ''

  return `${safeBaseName || 'exportacao'}${suffix}.${extension}`
}

function formatDate(value: Date) {
  return value.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  })
}

function formatDateTime(value: Date) {
  return value.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function parseNumber(value: ExportCellValue) {
  if (typeof value === 'number') return value
  if (typeof value !== 'string') return Number.NaN

  const sanitized = value.replace(/[^\d,.-]/g, '')
  const hasComma = sanitized.includes(',')
  const hasDot = sanitized.includes('.')
  const normalized =
    hasComma && hasDot
      ? sanitized.replace(/\./g, '').replace(',', '.')
      : sanitized.replace(',', '.')

  return Number(normalized)
}

function normalizeDate(value: ExportCellValue) {
  if (!value) return null

  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value

  if (typeof value === 'string') {
    const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (isoDate) {
      const [, year, month, day] = isoDate
      return new Date(Number(year), Number(month) - 1, Number(day), 12)
    }
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }

  return null
}

export function formatExportValue<T>(
  value: ExportCellValue,
  column: ExportColumn<T>,
  row: T,
  index: number,
) {
  if (column.format) return column.format(value, row, index)

  if (value === null || value === undefined || value === '') return ''

  if (column.type === 'date' || column.type === 'datetime') {
    const date = normalizeDate(value)
    if (!date) return ''

    return column.type === 'datetime' ? formatDateTime(date) : formatDate(date)
  }

  if (column.type === 'currency') {
    const numberValue = parseNumber(value)

    return Number.isFinite(numberValue) ? formatCurrency(numberValue) : ''
  }

  if (column.type === 'percent') {
    return typeof value === 'number' ? `${value}%` : String(value)
  }

  if (column.type === 'boolean') {
    return value ? 'Sim' : 'Nao'
  }

  if (value instanceof Date) return formatDate(value)

  return value
}

function getColumnValue<T>(row: T, column: ExportColumn<T>, index: number) {
  if (column.getValue) return column.getValue(row, index)
  if (!column.key) return undefined

  return row[column.key] as ExportCellValue
}

export function buildExportRows<T>({ columns, data }: ExportSheetConfig<T>) {
  const headers = columns.map((column) => column.header)
  const rows = data.map((row, rowIndex) =>
    columns.map((column) =>
      formatExportValue(
        getColumnValue(row, column, rowIndex),
        column,
        row,
        rowIndex,
      ),
    ),
  )

  return [headers, ...rows]
}

export function exportToXlsx<T>(config: ExportSheetConfig<T>) {
  const rows = buildExportRows(config)
  const worksheet = XLSX.utils.aoa_to_sheet(rows)

  worksheet['!cols'] = config.columns.map((column) => ({
    wch: column.width || Math.max(column.header.length + 2, 14),
  }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, config.sheetName || 'Dados')

  XLSX.writeFile(
    workbook,
    buildExportFileName(config.fileName, { extension: 'xlsx' }),
  )
}

function escapeCsvCell(value: string | number | boolean) {
  const stringValue = String(value)

  if (
    stringValue.includes(CSV_DELIMITER) ||
    stringValue.includes('"') ||
    stringValue.includes('\n')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

export function exportToCsv<T>(config: ExportSheetConfig<T>) {
  const rows = buildExportRows(config)
  const csv = rows
    .map((row) =>
      row
        .map((cell) =>
          escapeCsvCell(cell === null || cell === undefined ? '' : cell),
        )
        .join(CSV_DELIMITER),
    )
    .join('\r\n')

  const blob = new Blob([`${CSV_BOM}sep=${CSV_DELIMITER}\r\n${csv}`], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = buildExportFileName(config.fileName, { extension: 'csv' })
  document.body.appendChild(link)
  link.click()
  URL.revokeObjectURL(url)
  document.body.removeChild(link)
}

export function exportData<T>(
  format: ExportFormat,
  config: ExportSheetConfig<T>,
) {
  if (format === 'csv') {
    exportToCsv(config)
    return
  }

  exportToXlsx(config)
}
