'use server'

import apiInstance from '@/lib/api'
import type { SalesReportPdfData } from '@/app/(app-sidebar)/relatorios/vendas/pdf-types'
import type {
  SalesOrderBy,
  SalesPeriodBy,
} from '@/app/(app-sidebar)/relatorios/vendas/types'

interface SalesReportFilters {
  sellerId?: string
  originId?: string
  clientId?: string
  serieId?: string
  groupBy?: 'none' | 'client' | 'seller'
  orderBy?: SalesOrderBy
  periodBy?: SalesPeriodBy
  startDate?: string
  endDate?: string
}

export async function getSalesReportPdfData(
  filters?: SalesReportFilters,
): Promise<SalesReportPdfData | null> {
  const api = await apiInstance()
  try {
    const res = await api.get('/report/sales/pdf-data', { params: filters })
    return res.data
  } catch (error) {
    console.error('Error fetching sales report PDF data:', error)
    return null
  }
}
