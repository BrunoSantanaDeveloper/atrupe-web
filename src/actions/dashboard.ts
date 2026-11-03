'use server'

import apiInstance from '@/lib/api'
import type {
  SalesEvolutionResponse,
  SalesSummary,
  TopClientData,
  TopProductData,
} from '@/app/(app-sidebar)/relatorios/vendas/types'

type DashboardFilters = {
  startDate?: string
  endDate?: string
}

type FlowSideTotals = {
  expected: number
  totalPaid: number
  // Campos opcionais: versões anteriores da API não os devolviam.
  open?: number
  paidCount?: number
  overdue?: number
  overdueCount?: number
}

type FlowTotals = {
  receivables: FlowSideTotals
  payables: FlowSideTotals
}

type SalesSellerRanking = {
  name: string
  value: number
  count: number
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

const emptyFlowSideTotals: FlowSideTotals = {
  expected: 0,
  totalPaid: 0,
  open: 0,
  paidCount: 0,
  overdue: 0,
  overdueCount: 0,
}

const emptyFlowTotals: FlowTotals = {
  receivables: emptyFlowSideTotals,
  payables: emptyFlowSideTotals,
}

function cleanFilters(filters?: DashboardFilters) {
  return Object.fromEntries(
    Object.entries(filters || {}).filter(([, value]) => Boolean(value)),
  )
}

// O resumo financeiro do dashboard sai inteiro de /financial/flow/totals, para
// valor e legenda de cada card falarem do mesmo conjunto de parcelas. São duas
// janelas do mesmo período: o realizado vai pela data de pagamento, e o a
// realizar e os vencidos pelo vencimento. Com tudo pelo vencimento, a parcela
// que vence em novembro e foi recebida em outubro entrava como receita
// realizada de novembro.
export async function getDashboardFinancialOverview(
  filters?: DashboardFilters,
): Promise<{ byPaidDate: FlowTotals; byDueDate: FlowTotals }> {
  const api = await apiInstance()
  const params = cleanFilters(filters)

  try {
    const [byPaidDate, byDueDate] = await Promise.all([
      api.get('/financial/flow/totals', {
        params: { ...params, dateType: 'paidDate' },
      }),
      api.get('/financial/flow/totals', {
        params: { ...params, dateType: 'dueDate' },
      }),
    ])

    return {
      byPaidDate: byPaidDate.data || emptyFlowTotals,
      byDueDate: byDueDate.data || emptyFlowTotals,
    }
  } catch (error) {
    console.error('Error fetching dashboard financial overview:', error)
    return { byPaidDate: emptyFlowTotals, byDueDate: emptyFlowTotals }
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
