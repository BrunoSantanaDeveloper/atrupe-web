// Types for Financial Report

export interface FinancialSummary {
  received: number
  confirmed: number
  toReceive: number
  overdue: number
  receivedCount: number
  confirmedCount: number
  toReceiveCount: number
  overdueCount: number
}

export interface FinancialChartDataPoint {
  date: string
  label: string
  received: number
  confirmed: number
  toReceive: number
  overdue: number
}

export interface FinancialRecord {
  id: string
  clientId: string
  clientName: string
  description: string
  receivedDate: string | null
  value: number
  percentage: number
  status: 'received' | 'confirmed' | 'to_receive' | 'overdue'
}

export interface FinancialGroup {
  clientId: string
  clientName: string
  count: number
  total: number
  records: FinancialRecord[]
}

export interface FinancialTableData {
  grouped: boolean
  records: FinancialRecord[]
  groups?: FinancialGroup[]
  totalCount: number
  pagination: {
    page: number
    totalPages: number
    totalRecords: number
  }
}

export type FinancialTab = 'receitas' | 'despesas'
export type FinancialStatus =
  | 'all'
  | 'received'
  | 'confirmed'
  | 'to_receive'
  | 'overdue'
