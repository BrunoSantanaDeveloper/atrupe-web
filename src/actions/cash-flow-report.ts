'use server'

import { apiInstance } from '@/lib/api'

import type {
  CashFlowSummary,
  CashFlowChartDataPoint,
  CashFlowTableData,
} from '@/app/(app-sidebar)/relatorios/projecao-de-caixa/types'

interface CashFlowFilters {
  startDate?: string
  endDate?: string
  movement?: 'all' | 'revenue' | 'expense'
  groupBy?: 'none' | 'date' | 'client'
  orderBy?: 'dueDate' | 'valueDesc' | 'valueAsc' | 'clientName'
  page?: number
  limit?: number
}

const BASE_ROUTE = '/report/cash-flow'

export async function getCashFlowSummary(
  filters?: CashFlowFilters,
): Promise<CashFlowSummary | null> {
  const api = await apiInstance()
  try {
    const res = await api.get(`${BASE_ROUTE}/summary`, { params: filters })
    return res.data
  } catch (error) {
    console.error('Error fetching cash flow summary:', error)
    return null
  }
}

export async function getCashFlowChart(
  filters?: CashFlowFilters,
): Promise<CashFlowChartDataPoint[]> {
  const api = await apiInstance()
  try {
    const res = await api.get(`${BASE_ROUTE}/chart`, { params: filters })
    return res.data
  } catch (error) {
    console.error('Error fetching cash flow chart:', error)
    return []
  }
}

export async function getCashFlowTable(
  filters?: CashFlowFilters,
): Promise<CashFlowTableData> {
  const api = await apiInstance()
  try {
    const res = await api.get(`${BASE_ROUTE}/table`, { params: filters })
    return res.data
  } catch (error) {
    console.error('Error fetching cash flow table:', error)
    return {
      grouped: false,
      records: [],
      totalCount: 0,
      pagination: {
        page: 1,
        totalPages: 1,
        totalRecords: 0,
      },
    }
  }
}
