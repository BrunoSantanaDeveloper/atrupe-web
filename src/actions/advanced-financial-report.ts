'use server'

import apiInstance from '@/lib/api'
import type { FinancialPdfData } from '@/app/(app-sidebar)/relatorios/financeiro/pdf-types'

interface AdvancedFinancialPdfFilters {
  tab?: string
  startDate?: string
  endDate?: string
  status?: string
  natureId?: string
  bankAccountId?: string
  paymentConditionId?: string
  clientId?: string
  includeTransfers?: 'yes' | 'no'
  periodType?: 'emission' | 'dueDate' | 'payment' | 'cancel'
  groupBy?: 'none' | 'client'
  orderBy?: string
}

export async function getAdvancedFinancialPdfData(
  filters?: AdvancedFinancialPdfFilters,
): Promise<FinancialPdfData | null> {
  const api = await apiInstance()
  try {
    const res = await api.get('/report/financial/advanced-pdf-data', {
      params: filters,
    })
    return res.data
  } catch (error) {
    console.error('Error fetching advanced financial report PDF data:', error)
    return null
  }
}
