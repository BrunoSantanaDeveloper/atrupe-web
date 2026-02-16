// Types
export type RegimeType = 'realizado' | 'orcado'

export interface DfcSummary {
  totalRevenue: number
  totalExpenses: number
  finalCashFlow: number
}

export interface DfcCashFlowDataPoint {
  month: string
  label: string
  positive: number
  negative: number
}

export interface DfcRevenueExpenseDataPoint {
  month: string
  label: string
  revenue: number
  expenses: number
}

export interface DfcTableRow {
  id: string
  code: string
  name: string
  level: number
  isExpandable: boolean
  isExpanded?: boolean
  parentId?: string
  values: Record<string, number> // month -> value
}

export interface DfcTableData {
  headers: string[] // months
  rows: DfcTableRow[]
}
