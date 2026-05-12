'use server'

import apiInstance from '@/lib/api'
import type { FinancialPdfData } from '@/app/(app-sidebar)/relatorios/financeiro/pdf-types'

interface FinancialPdfFilters {
  tab?: string
  startDate?: string
  endDate?: string
  status?: string
  clientId?: string
}

export async function getFinancialPdfData(
  filters?: FinancialPdfFilters,
): Promise<FinancialPdfData | null> {
  const api = await apiInstance()
  try {
    const res = await api.get('/report/financial/pdf-data', { params: filters })
    return res.data
  } catch (error) {
    console.error('Error fetching financial report PDF data:', error)
    return null
  }
}
