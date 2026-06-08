'use server'

import apiInstance from '@/lib/api'
import type {
  SalesEvolutionResponse,
  SalesSummary,
  TopClientData,
  TopProductData,
} from '@/app/(app-sidebar)/relatorios/vendas/types'
import type { FinancialSummary } from '@/app/(app-sidebar)/relatorios/financeiro/types'

type DashboardFilters = {
  startDate?: string
  endDate?: string
}

type FlowTotals = {
  receivables: {
    expected: number
    totalPaid: number
  }
  payables: {
    expected: number
    totalPaid: number
  }
}

type SalesSellerRanking = {
  name: string
  value: number
  count: number
}

const emptyFinancialSummary: FinancialSummary = {
  received: 0,
  confirmed: 0,
  toReceive: 0,
  overdue: 0,
  receivedCount: 0,
  confirmedCount: 0,
  toReceiveCount: 0,
  overdueCount: 0,
}

const emptySalesSummary: SalesSummary = {
  approvedTotal: 0,
  approvedCount: 0,
  rejectedTotal: 0,
  rejectedCount: 0,
  noResponseTotal: 0,
  noResponseCount: 0,
  expiredTotal: 0,
  expiredCount: 0,
  canceledTotal: 0,
  canceledCount: 0,
  averageTicket: 0,
  commission: 0,
  approvalTime: '0d 0h',
}

const emptyFlowTotals: FlowTotals = {
  receivables: {
    expected: 0,
    totalPaid: 0,
  },
  payables: {
    expected: 0,
    totalPaid: 0,
  },
}

function cleanFilters(filters?: DashboardFilters) {
  return Object.fromEntries(
    Object.entries(filters || {}).filter(([, value]) => Boolean(value)),
  )
}

export async function getDashboardFinancialOverview(
  filters?: DashboardFilters,
): Promise<{
  revenues: FinancialSummary
  expenses: FinancialSummary
  totals: FlowTotals
}> {
  const api = await apiInstance()
  const params = cleanFilters(filters)

  try {
    const [revenues, expenses, totals] = await Promise.all([
      api.get('/report/financial/summary', {
        params: { ...params, tab: 'receitas' },
      }),
      api.get('/report/financial/summary', {
        params: { ...params, tab: 'despesas' },
      }),
      api.get('/financial/flow/totals', { params }),
    ])

    return {
      revenues: revenues.data || emptyFinancialSummary,
      expenses: expenses.data || emptyFinancialSummary,
      totals: totals.data || emptyFlowTotals,
    }
  } catch (error) {
    console.error('Error fetching dashboard financial overview:', error)
    return {
      revenues: emptyFinancialSummary,
      expenses: emptyFinancialSummary,
      totals: emptyFlowTotals,
    }
  }
}

export async function getDashboardSalesSummary(
  filters?: DashboardFilters,
): Promise<SalesSummary> {
  const api = await apiInstance()

  try {
    const res = await api.get('/report/sales/summary', {
      params: cleanFilters(filters),
    })
    return res.data || emptySalesSummary
  } catch (error) {
    console.error('Error fetching dashboard sales summary:', error)
    return emptySalesSummary
  }
}

export async function getDashboardSalesEvolution(
  filters?: DashboardFilters,
): Promise<SalesEvolutionResponse> {
  const api = await apiInstance()

  try {
    const res = await api.get('/report/sales/evolution', {
      params: cleanFilters(filters),
    })
    return res.data
  } catch (error) {
    console.error('Error fetching dashboard sales evolution:', error)
    return { mode: 'daily', data: [], yearlyData: [] }
  }
}

export async function getDashboardTopClients(
  filters?: DashboardFilters,
): Promise<TopClientData[]> {
  const api = await apiInstance()

  try {
    const res = await api.get('/report/sales/top-clients', {
      params: cleanFilters(filters),
    })
    return res.data || []
  } catch (error) {
    console.error('Error fetching dashboard top clients:', error)
    return []
  }
}

export async function getDashboardTopProducts(
  filters?: DashboardFilters,
): Promise<TopProductData[]> {
  const api = await apiInstance()

  try {
    const res = await api.get('/report/sales/top-products', {
      params: cleanFilters(filters),
    })
    return res.data || []
  } catch (error) {
    console.error('Error fetching dashboard top products:', error)
    return []
  }
}

export async function getDashboardSalesBySeller(
  filters?: DashboardFilters,
): Promise<SalesSellerRanking[]> {
  const api = await apiInstance()

  try {
    const res = await api.get('/report/sales/by-seller', {
      params: cleanFilters(filters),
    })

    return res.data || []
  } catch (error) {
    console.error('Error fetching dashboard sales by seller:', error)
    return []
  }
}
