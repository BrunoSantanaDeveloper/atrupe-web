'use server'

import type {
  CashFlowSummary,
  CashFlowChartDataPoint,
  CashFlowTableData,
  CashFlowRecord,
  CashFlowGroup,
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

// ============================================
// MOCK DATA - Remover quando backend estiver pronto
// ============================================

const MOCK_SUMMARY: CashFlowSummary = {
  expectedRevenue: 14898125, // R$ 148.981,25 em centavos
  expectedExpenses: 2786405, // R$ 27.864,05 em centavos
  expectedBalance: 12102720, // R$ 121.027,20 em centavos
}

const MOCK_CHART_DATA: CashFlowChartDataPoint[] = [
  {
    date: '2025-12-01',
    label: '01 dez 25',
    revenue: 850000,
    expenses: 210000,
    balance: 640000,
  },
  {
    date: '2025-12-02',
    label: '02 dez 25',
    revenue: 1200000,
    expenses: 350000,
    balance: 1490000,
  },
  {
    date: '2025-12-03',
    label: '03 dez 25',
    revenue: 980000,
    expenses: 420000,
    balance: 2050000,
  },
  {
    date: '2025-12-04',
    label: '04 dez 25',
    revenue: 720000,
    expenses: 180000,
    balance: 2590000,
  },
  {
    date: '2025-12-05',
    label: '05 dez 25',
    revenue: 650000,
    expenses: 520000,
    balance: 2720000,
  },
  {
    date: '2025-12-06',
    label: '06 dez 25',
    revenue: 1075000,
    expenses: 234500,
    balance: 3560500,
  },
  {
    date: '2025-12-07',
    label: '07 dez 25',
    revenue: 450000,
    expenses: 120000,
    balance: 3890500,
  },
  {
    date: '2025-12-08',
    label: '08 dez 25',
    revenue: 820000,
    expenses: 310000,
    balance: 4400500,
  },
  {
    date: '2025-12-09',
    label: '09 dez 25',
    revenue: 560000,
    expenses: 280000,
    balance: 4680500,
  },
  {
    date: '2025-12-10',
    label: '10 dez 25',
    revenue: 780000,
    expenses: 150000,
    balance: 5310500,
  },
  {
    date: '2025-12-11',
    label: '11 dez 25',
    revenue: 920000,
    expenses: 410000,
    balance: 5820500,
  },
  {
    date: '2025-12-12',
    label: '12 dez 25',
    revenue: 680000,
    expenses: 220000,
    balance: 6280500,
  },
]

const MOCK_RECORDS: CashFlowRecord[] = [
  {
    id: '1',
    clientId: 'c1',
    clientName: 'Nome do Cliente Ltda',
    description: '108-v1 - Venda rápida',
    dueDate: '2025-12-01',
    value: 5000000,
    percentage: 14,
    type: 'revenue',
  },
  {
    id: '2',
    clientId: 'c1',
    clientName: 'Nome do Cliente Ltda',
    description: '107-v1 - Descrição do serviço',
    dueDate: '2025-12-01',
    value: 500000,
    percentage: 14,
    type: 'revenue',
  },
  {
    id: '3',
    clientId: 'c1',
    clientName: 'Nome do Cliente Ltda',
    description: '106-v1 - Descrição do serviço',
    dueDate: '2025-12-01',
    value: -500000,
    percentage: 14,
    type: 'expense',
  },
  {
    id: '4',
    clientId: 'c1',
    clientName: 'Nome do Cliente Ltda',
    description: '105-v1 - Descrição do serviço',
    dueDate: '2025-12-01',
    value: -500000,
    percentage: 14,
    type: 'expense',
  },
  {
    id: '5',
    clientId: 'c2',
    clientName: 'Empresa ABC S/A',
    description: '26-11 - Descrição do serviço',
    dueDate: '2025-12-02',
    value: 500000,
    percentage: 14,
    type: 'revenue',
  },
  {
    id: '6',
    clientId: 'c2',
    clientName: 'Empresa ABC S/A',
    description: '104-v1 - Descrição do serviço',
    dueDate: '2025-12-02',
    value: -500000,
    percentage: 14,
    type: 'expense',
  },
  {
    id: '7',
    clientId: 'c3',
    clientName: 'Tech Solutions',
    description: '103-v1 - Descrição do serviço',
    dueDate: '2025-12-02',
    value: 500000,
    percentage: 14,
    type: 'revenue',
  },
  {
    id: '8',
    clientId: 'c3',
    clientName: 'Tech Solutions',
    description: '25-11 - Descrição do serviço',
    dueDate: '2025-12-02',
    value: -500000,
    percentage: 14,
    type: 'expense',
  },
  {
    id: '9',
    clientId: 'c4',
    clientName: 'Digital Marketing Co',
    description: '102-v1 - Descrição do serviço',
    dueDate: '2025-12-02',
    value: 500000,
    percentage: 14,
    type: 'revenue',
  },
  {
    id: '10',
    clientId: 'c4',
    clientName: 'Digital Marketing Co',
    description: '101-v1 - Descrição do serviço',
    dueDate: '2025-12-02',
    value: -500000,
    percentage: 14,
    type: 'expense',
  },
]

function groupRecordsByDate(records: CashFlowRecord[]): CashFlowGroup[] {
  const grouped = records.reduce(
    (acc, record) => {
      const date = record.dueDate
      if (!acc[date]) {
        acc[date] = { date, count: 0, total: 0, records: [] }
      }
      acc[date].count++
      acc[date].total += record.value
      acc[date].records.push(record)
      return acc
    },
    {} as Record<string, CashFlowGroup>,
  )
  return Object.values(grouped)
}

// ============================================
// API FUNCTIONS (usando mock por enquanto)
// ============================================

export async function getCashFlowSummary(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filters?: CashFlowFilters,
): Promise<CashFlowSummary | null> {
  // TODO: Substituir por chamada real quando backend estiver pronto
  // const api = await apiInstance()
  // const res = await api.get('/report/cash-flow/summary', { params: filters })
  // return res.data

  // Mock data
  await new Promise((resolve) => setTimeout(resolve, 300))
  return MOCK_SUMMARY
}

export async function getCashFlowChart(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filters?: CashFlowFilters,
): Promise<CashFlowChartDataPoint[]> {
  // TODO: Substituir por chamada real quando backend estiver pronto
  // const api = await apiInstance()
  // const res = await api.get('/report/cash-flow/chart', { params: filters })
  // return res.data

  // Mock data
  await new Promise((resolve) => setTimeout(resolve, 500))
  return MOCK_CHART_DATA
}

export async function getCashFlowTable(
  filters?: CashFlowFilters,
): Promise<CashFlowTableData> {
  // TODO: Substituir por chamada real quando backend estiver pronto
  // const api = await apiInstance()
  // const res = await api.get('/report/cash-flow/table', { params: filters })
  // return res.data

  // Mock data
  await new Promise((resolve) => setTimeout(resolve, 400))

  let records = [...MOCK_RECORDS]

  // Filter by movement type
  if (filters?.movement === 'revenue') {
    records = records.filter((r) => r.value >= 0)
  } else if (filters?.movement === 'expense') {
    records = records.filter((r) => r.value < 0)
  }

  // Pagination
  const page = filters?.page || 1
  const limit = filters?.limit || 10
  const start = (page - 1) * limit
  const paginatedRecords = records.slice(start, start + limit)

  const isGrouped = filters?.groupBy === 'date' || filters?.groupBy === 'client'

  return {
    grouped: isGrouped,
    records: isGrouped ? [] : paginatedRecords,
    groups: isGrouped ? groupRecordsByDate(paginatedRecords) : undefined,
    totalCount: records.length,
    pagination: {
      page,
      totalPages: Math.ceil(records.length / limit),
      totalRecords: records.length,
    },
  }
}
