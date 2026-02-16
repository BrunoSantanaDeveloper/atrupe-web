'use server'

import apiInstance from '@/lib/api'
import type {
  SalesSummary,
  SalesEvolutionResponse,
  ApprovedRejectedData,
  OriginChartData,
  TopProductData,
  TopClientData,
  SalesTableData,
} from '@/app/(app-sidebar)/relatorios/vendas/types'

interface SalesReportFilters {
  sellerId?: string
  originId?: string
  startDate?: string
  endDate?: string
  groupBy?: 'none' | 'client' | 'seller'
  orderBy?: 'approvedDate' | 'valueDesc' | 'valueAsc'
  page?: number
  limit?: number
}

const BASE_ROUTE = '/report/sales'

export async function getSalesReportSummary(
  filters?: SalesReportFilters,
): Promise<SalesSummary | null> {
  const api = await apiInstance()
  try {
    const res = await api.get(`${BASE_ROUTE}/summary`, { params: filters })
    return res.data
  } catch (error) {
    console.error('Error fetching sales summary:', error)
    return null
  }
}

export async function getSalesEvolution(
  filters?: SalesReportFilters,
): Promise<SalesEvolutionResponse> {
  const api = await apiInstance()
  try {
    const res = await api.get(`${BASE_ROUTE}/evolution`, { params: filters })
    return res.data
  } catch (error) {
    console.error('Error fetching sales evolution:', error)
    return { mode: 'daily', data: [], yearlyData: [] }
  }
}

export async function getApprovedRejected(
  filters?: SalesReportFilters,
): Promise<ApprovedRejectedData[]> {
  const api = await apiInstance()
  try {
    const res = await api.get(`${BASE_ROUTE}/approved-rejected`, {
      params: filters,
    })
    return res.data
  } catch (error) {
    console.error('Error fetching approved/rejected:', error)
    return []
  }
}

export async function getQuotationsOrigin(
  filters?: SalesReportFilters,
): Promise<OriginChartData[]> {
  const api = await apiInstance()
  try {
    const res = await api.get(`${BASE_ROUTE}/quotations-origin`, {
      params: filters,
    })
    return res.data
  } catch (error) {
    console.error('Error fetching quotations origin:', error)
    return []
  }
}

export async function getOrdersOrigin(
  filters?: SalesReportFilters,
): Promise<OriginChartData[]> {
  const api = await apiInstance()
  try {
    const res = await api.get(`${BASE_ROUTE}/orders-origin`, {
      params: filters,
    })
    return res.data
  } catch (error) {
    console.error('Error fetching orders origin:', error)
    return []
  }
}

export async function getTopProducts(
  filters?: SalesReportFilters,
): Promise<TopProductData[]> {
  const api = await apiInstance()
  try {
    const res = await api.get(`${BASE_ROUTE}/top-products`, {
      params: filters,
    })
    return res.data
  } catch (error) {
    console.error('Error fetching top products:', error)
    return []
  }
}

export async function getTopClients(
  filters?: SalesReportFilters,
): Promise<TopClientData[]> {
  const api = await apiInstance()
  try {
    const res = await api.get(`${BASE_ROUTE}/top-clients`, { params: filters })
    return res.data
  } catch (error) {
    console.error('Error fetching top clients:', error)
    return []
  }
}

type SalesTableDataWithPagination = SalesTableData & {
  pagination: {
    page: number
    totalPages: number
    totalRecords: number
  }
}

export async function getSalesTableData(
  filters?: SalesReportFilters,
): Promise<SalesTableDataWithPagination> {
  const api = await apiInstance()
  try {
    const res = await api.get(`${BASE_ROUTE}/table`, { params: filters })
    return res.data
  } catch (error) {
    console.error('Error fetching sales table:', error)
    return {
      grouped: false,
      records: [],
      totalCount: 0,
      pagination: { page: 1, totalPages: 1, totalRecords: 0 },
    }
  }
}

export async function getSalesPermissions(): Promise<{
  canSeeOtherSellers: boolean
}> {
  const api = await apiInstance()
  try {
    const res = await api.get(`${BASE_ROUTE}/permissions`)
    return res.data
  } catch (error) {
    console.error('Error fetching sales permissions:', error)
    return { canSeeOtherSellers: false }
  }
}

export async function getSellers(): Promise<{ id: string; name: string }[]> {
  const api = await apiInstance()
  try {
    const res = await api.get('/sellers')
    return res.data
  } catch (error) {
    console.error('Error fetching sellers:', error)
    return []
  }
}
