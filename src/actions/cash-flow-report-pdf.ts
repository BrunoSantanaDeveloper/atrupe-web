'use server'

import apiInstance from '@/lib/api'
import type { CashFlowPdfData } from '@/app/(app-sidebar)/relatorios/projecao-de-caixa/pdf-types'

interface CashFlowPdfFilters {
  startDate?: string
  endDate?: string
  movement?: string
}

export async function getCashFlowPdfData(
  filters?: CashFlowPdfFilters,
): Promise<CashFlowPdfData | null> {
  const api = await apiInstance()
  try {
    const res = await api.get('/report/cash-flow/pdf-data', {
      params: filters,
    })
    return res.data
  } catch (error) {
    console.error('Error fetching cash flow PDF data:', error)
    return null
  }
}
