'use server'

import apiInstance from '@/lib/api'
import type {
  FinancialSummary,
  FinancialChartDataPoint,
  FinancialTableData,
  FinancialTab,
} from '@/app/(app-sidebar)/relatorios/financeiro/types'

interface FinancialFilters {
  tab?: FinancialTab
  startDate?: string
  endDate?: string
  status?: 'received' | 'confirmed' | 'to_receive' | 'overdue'
  groupBy?: 'none' | 'client'
  orderBy?: 'saleDate' | 'dueDate' | 'receivedDate' | 'valueDesc' | 'valueAsc'
  page?: number
  limit?: number
}

const BASE_ROUTE = '/report/financial'

export async function getFinancialSummary(
  filters?: FinancialFilters,
): Promise<FinancialSummary | null> {
  const api = await apiInstance()
  try {
    const res = await api.get(`${BASE_ROUTE}/summary`, { params: filters })
    return res.data
  } catch (error) {
    console.error('Error fetching financial summary:', error)
    return null
  }
}

export async function getFinancialChart(
  filters?: FinancialFilters,
): Promise<FinancialChartDataPoint[]> {
  const api = await apiInstance()
  try {
    const res = await api.get(`${BASE_ROUTE}/chart`, { params: filters })
    return res.data
  } catch (error) {
    console.error('Error fetching financial chart:', error)
    return []
  }
}

export async function getFinancialTable(
  filters?: FinancialFilters,
): Promise<FinancialTableData> {
  const api = await apiInstance()
  try {
    const res = await api.get(`${BASE_ROUTE}/table`, { params: filters })
    return res.data
  } catch (error) {
    console.error('Error fetching financial table:', error)
    return {
      grouped: false,
      records: [],
      totalCount: 0,
      pagination: {
        page: 1,
        totalPages: 0,
        totalRecords: 0,
      },
    }
  }
}
