'use server'

import apiInstance from '@/lib/api'

import type {
  CommissionSummary,
  CommissionTableData,
  CommissionType,
  CommissionGroupBy,
  CommissionOrderBy,
} from '@/app/(app-sidebar)/relatorios/comissoes/types'

interface CommissionSummaryFilters {
  commissionType?: CommissionType
  startDate?: string
  endDate?: string
  receivedStartDate?: string
  receivedEndDate?: string
  sellerId?: string
}

interface CommissionTableFilters {
  commissionType?: CommissionType
  startDate?: string
  endDate?: string
  receivedStartDate?: string
  receivedEndDate?: string
  sellerId?: string
  groupBy?: CommissionGroupBy
  orderBy?: CommissionOrderBy
  page?: number
  limit?: number
}

const BASE_ROUTE = '/report/commission'

export async function getCommissionSummary(
  filters?: CommissionSummaryFilters,
): Promise<CommissionSummary> {
  const api = await apiInstance()
  try {
    const res = await api.get(`${BASE_ROUTE}/summary`, { params: filters })
    return res.data
  } catch (error) {
    console.error('Error fetching commission summary:', error)
    return {
      salesTotal: 0,
      salesCount: 0,
      receivedTotal: 0,
      receivedCount: 0,
      commissionTotal: 0,
    }
  }
}

export async function getCommissionTable(
  filters?: CommissionTableFilters,
): Promise<CommissionTableData> {
  const api = await apiInstance()
  try {
    const res = await api.get(`${BASE_ROUTE}/table`, { params: filters })
    return res.data
  } catch (error) {
    console.error('Error fetching commission table:', error)
    return {
      grouped: false,
      records: [],
      groups: [],
      totalCount: 0,
      pagination: {
        page: 1,
        totalPages: 1,
      },
    }
  }
}
