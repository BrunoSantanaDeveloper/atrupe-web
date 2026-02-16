// Types for Cash Flow Report PDF/Excel Export

import type { FinancialPdfCompany } from '../financeiro/pdf-types'

export interface CashFlowPdfRecord {
  id: string
  clientName: string
  description: string
  dueDate: string
  value: number
  percentage: number
  type: 'revenue' | 'expense'
}

export interface CashFlowPdfGroup {
  date: string
  count: number
  total: number
  records: CashFlowPdfRecord[]
}

export interface CashFlowPdfData {
  company: FinancialPdfCompany
  totalRevenue: number
  totalExpenses: number
  totalBalance: number
  totalCount: number
  groups: CashFlowPdfGroup[]
}
