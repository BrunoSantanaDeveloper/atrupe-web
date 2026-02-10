'use server'

import apiInstance from '@/lib/api'

// Types
import type {
  DfcSummary,
  DfcCashFlowDataPoint,
  DfcRevenueExpenseDataPoint,
  DfcTableData,
} from '@/app/(app-sidebar)/relatorios/dfc/types'

interface DfcFilters {
  startDate?: string
  endDate?: string
  regime?: 'realizado' | 'orcado'
}

const BASE_ROUTE = '/report/dfc'

export async function getDfcSummary(filters?: DfcFilters): Promise<DfcSummary> {
  const api = await apiInstance()
  try {
    const res = await api.get(`${BASE_ROUTE}/summary`, { params: filters })
    return res.data
  } catch (error) {
    console.error('Error fetching DFC summary:', error)
    return { totalRevenue: 0, totalExpenses: 0, finalCashFlow: 0 }
  }
}

export async function getDfcCashFlowChart(
  filters?: DfcFilters,
): Promise<DfcCashFlowDataPoint[]> {
  const api = await apiInstance()
  try {
    const res = await api.get(`${BASE_ROUTE}/cash-flow-chart`, {
      params: filters,
    })
    return res.data
  } catch (error) {
    console.error('Error fetching DFC cash flow chart:', error)
    return []
  }
}

export async function getDfcRevenueExpenseChart(
  filters?: DfcFilters,
): Promise<DfcRevenueExpenseDataPoint[]> {
  const api = await apiInstance()
  try {
    const res = await api.get(`${BASE_ROUTE}/revenue-expense-chart`, {
      params: filters,
    })
    return res.data
  } catch (error) {
    console.error('Error fetching DFC revenue/expense chart:', error)
    return []
  }
}

export async function getDfcTable(filters?: DfcFilters): Promise<DfcTableData> {
  const api = await apiInstance()
  try {
    const res = await api.get(`${BASE_ROUTE}/table`, { params: filters })
    return res.data
  } catch (error) {
    console.error('Error fetching DFC table:', error)
    return { headers: [], rows: [] }
  }
}
