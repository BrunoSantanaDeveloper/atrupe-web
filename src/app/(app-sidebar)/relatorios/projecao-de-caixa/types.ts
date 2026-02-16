// Types for Cash Flow Projection Report

export interface CashFlowSummary {
  expectedRevenue: number
  expectedExpenses: number
  expectedBalance: number
}

export interface CashFlowChartDataPoint {
  date: string
  label: string // formatted date label
  revenue: number
  expenses: number
  balance: number
}

export interface CashFlowRecord {
  id: string
  clientId: string
  clientName: string
  description: string
  dueDate: string
  value: number // positive = revenue, negative = expense
  percentage: number
  type: 'revenue' | 'expense'
}

export interface CashFlowGroup {
  date: string
  count: number
  total: number
  records: CashFlowRecord[]
}

export interface CashFlowTableData {
  grouped: boolean
  records: CashFlowRecord[]
  groups?: CashFlowGroup[]
  totalCount: number
  pagination: {
    page: number
    totalPages: number
    totalRecords: number
  }
}
