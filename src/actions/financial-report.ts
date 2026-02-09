'use server'

import type {
  FinancialSummary,
  FinancialChartDataPoint,
  FinancialTableData,
  FinancialRecord,
  FinancialGroup,
  FinancialTab,
} from '@/app/(app-sidebar)/relatorios/financeiro/types'

interface FinancialFilters {
  tab?: FinancialTab
  startDate?: string
  endDate?: string
  status?: 'all' | 'received' | 'confirmed' | 'to_receive' | 'overdue'
  groupBy?: 'none' | 'client' | 'date'
  orderBy?: 'receivedDate' | 'valueDesc' | 'valueAsc' | 'clientName'
  page?: number
  limit?: number
}

// ============================================
// MOCK DATA - Remover quando backend estiver pronto
// ============================================

const MOCK_SUMMARY: FinancialSummary = {
  received: 4898125, // R$ 48.981,25
  confirmed: 1005080, // R$ 10.050,80
  toReceive: 786405, // R$ 7.864,05
  overdue: 786405, // R$ 7.864,05
  receivedCount: 230,
  confirmedCount: 120,
  toReceiveCount: 68,
  overdueCount: 68,
}

const MOCK_CHART_DATA: FinancialChartDataPoint[] = [
  // Padrão exato do design - valores em centavos (dividido por 100 no display)
  // Green=received, Blue=confirmed, Yellow=toReceive, Red=overdue
  {
    date: '2025-12-01',
    label: '01 dez 25',
    received: 100000, // G: ~R$1k (baixo)
    confirmed: 350000, // B: ~R$3.5k
    toReceive: 50000, // Y: ~R$0.5k (muito baixo)
    overdue: 0, // R: R$0 (começa no zero)
  },
  {
    date: '2025-12-02',
    label: '02 dez 25',
    received: 750000, // G: ~R$7.5k (1º pico)
    confirmed: 650000, // B: ~R$6.5k (1º pico)
    toReceive: 650000, // Y: ~R$6.5k (1º pico)
    overdue: 300000, // R: ~R$3k
  },
  {
    date: '2025-12-03',
    label: '03 dez 25',
    received: 550000, // G: descida
    confirmed: 500000, // B: descida
    toReceive: 400000, // Y: descida
    overdue: 350000, // R: sobe um pouco
  },
  {
    date: '2025-12-04',
    label: '04 dez 25',
    received: 500000, // G: estável
    confirmed: 580000, // B: leve subida
    toReceive: 550000, // Y: subida
    overdue: 350000, // R: estável
  },
  {
    date: '2025-12-05',
    label: '05 dez 25',
    received: 800000, // G: subindo
    confirmed: 600000, // B: subindo
    toReceive: 600000, // Y: subindo
    overdue: 500000, // R: subindo
  },
  {
    date: '2025-12-06',
    label: '06 dez 25',
    received: 980000, // G: ~R$9.8k (pico máximo)
    confirmed: 950000, // B: ~R$9.5k (pico máximo)
    toReceive: 800000, // Y: ~R$8k (pico)
    overdue: 600000, // R: ~R$6k (pico)
  },
  {
    date: '2025-12-07',
    label: '07 dez 25',
    received: 300000, // G: ~R$3k (vale profundo)
    confirmed: 400000, // B: ~R$4k (vale)
    toReceive: 250000, // Y: ~R$2.5k (vale mais baixo)
    overdue: 300000, // R: ~R$3k (vale)
  },
  {
    date: '2025-12-08',
    label: '08 dez 25',
    received: 500000, // G: subida
    confirmed: 500000, // B: subida
    toReceive: 400000, // Y: subida
    overdue: 400000, // R: subida
  },
  {
    date: '2025-12-09',
    label: '09 dez 25',
    received: 350000, // G: ~R$3.5k (dip)
    confirmed: 450000, // B: ~R$4.5k (dip)
    toReceive: 300000, // Y: ~R$3k (dip)
    overdue: 350000, // R: ~R$3.5k (dip)
  },
  {
    date: '2025-12-10',
    label: '10 dez 25',
    received: 550000, // G: subida
    confirmed: 550000, // B: subida
    toReceive: 450000, // Y: subida
    overdue: 450000, // R: subida
  },
  {
    date: '2025-12-11',
    label: '11 dez 25',
    received: 700000, // G: ~R$7k (subindo mais)
    confirmed: 480000, // B: ~R$4.8k (dip menor)
    toReceive: 550000, // Y: ~R$5.5k
    overdue: 380000, // R: ~R$3.8k (dip)
  },
  {
    date: '2025-12-12',
    label: '12 dez 25',
    received: 750000, // G: ~R$7.5k (final alto)
    confirmed: 520000, // B: ~R$5.2k
    toReceive: 500000, // Y: ~R$5k (leve dip no final)
    overdue: 400000, // R: ~R$4k
  },
]

const MOCK_RECORDS: FinancialRecord[] = [
  {
    id: '1',
    clientId: 'c1',
    clientName: 'Nome do Cliente Ltda',
    description: '108-v1 - Venda rápida',
    receivedDate: '00/00/0000',
    value: 5000000,
    percentage: 14,
    status: 'received',
  },
  {
    id: '2',
    clientId: 'c1',
    clientName: 'Nome do Cliente Ltda',
    description: '107-v1 - Descrição do serviço',
    receivedDate: '00/00/0000',
    value: 500000,
    percentage: 14,
    status: 'received',
  },
  {
    id: '3',
    clientId: 'c1',
    clientName: 'Nome do Cliente Ltda',
    description: '106-v1 - Descrição do serviço',
    receivedDate: '00/00/0000',
    value: 500000,
    percentage: 14,
    status: 'confirmed',
  },
  {
    id: '4',
    clientId: 'c1',
    clientName: 'Nome do Cliente Ltda',
    description: '105-v1 - Descrição do serviço',
    receivedDate: '00/00/0000',
    value: 500000,
    percentage: 14,
    status: 'to_receive',
  },
  {
    id: '5',
    clientId: 'c2',
    clientName: 'Nome do Cliente Ltda',
    description: '26-11 - Descrição do serviço',
    receivedDate: '00/00/0000',
    value: 500000,
    percentage: 14,
    status: 'received',
  },
  {
    id: '6',
    clientId: 'c2',
    clientName: 'Nome do Cliente Ltda',
    description: '104-v1 - Descrição do serviço',
    receivedDate: '00/00/0000',
    value: 500000,
    percentage: 14,
    status: 'overdue',
  },
  {
    id: '7',
    clientId: 'c2',
    clientName: 'Nome do Cliente Ltda',
    description: '103-v1 - Descrição do serviço',
    receivedDate: '00/00/0000',
    value: 500000,
    percentage: 14,
    status: 'received',
  },
  {
    id: '8',
    clientId: 'c2',
    clientName: 'Nome do Cliente Ltda',
    description: '25-11 - Descrição do serviço',
    receivedDate: '00/00/0000',
    value: 500000,
    percentage: 14,
    status: 'overdue',
  },
  {
    id: '9',
    clientId: 'c2',
    clientName: 'Nome do Cliente Ltda',
    description: '102-v1 - Descrição do serviço',
    receivedDate: '00/00/0000',
    value: 500000,
    percentage: 14,
    status: 'confirmed',
  },
  {
    id: '10',
    clientId: 'c2',
    clientName: 'Nome do Cliente Ltda',
    description: '101-v1 - Descrição do serviço',
    receivedDate: '00/00/0000',
    value: 500000,
    percentage: 14,
    status: 'to_receive',
  },
]

function groupRecordsByClient(records: FinancialRecord[]): FinancialGroup[] {
  const grouped = records.reduce(
    (acc, record) => {
      const clientId = record.clientId
      if (!acc[clientId]) {
        acc[clientId] = {
          clientId,
          clientName: record.clientName,
          count: 0,
          total: 0,
          records: [],
        }
      }
      acc[clientId].count++
      acc[clientId].total += record.value
      acc[clientId].records.push(record)
      return acc
    },
    {} as Record<string, FinancialGroup>,
  )
  return Object.values(grouped)
}

// ============================================
// API FUNCTIONS (usando mock por enquanto)
// ============================================

export async function getFinancialSummary(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filters?: FinancialFilters,
): Promise<FinancialSummary | null> {
  // TODO: Substituir por chamada real quando backend estiver pronto
  await new Promise((resolve) => setTimeout(resolve, 300))
  return MOCK_SUMMARY
}

export async function getFinancialChart(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filters?: FinancialFilters,
): Promise<FinancialChartDataPoint[]> {
  // TODO: Substituir por chamada real quando backend estiver pronto
  await new Promise((resolve) => setTimeout(resolve, 500))
  return MOCK_CHART_DATA
}

export async function getFinancialTable(
  filters?: FinancialFilters,
): Promise<FinancialTableData> {
  // TODO: Substituir por chamada real quando backend estiver pronto
  await new Promise((resolve) => setTimeout(resolve, 400))

  let records = [...MOCK_RECORDS]

  // Filter by status
  if (filters?.status && filters.status !== 'all') {
    records = records.filter((r) => r.status === filters.status)
  }

  // Pagination
  const page = filters?.page || 1
  const limit = filters?.limit || 10
  const start = (page - 1) * limit
  const paginatedRecords = records.slice(start, start + limit)

  const isGrouped = filters?.groupBy === 'client'

  return {
    grouped: isGrouped,
    records: isGrouped ? [] : paginatedRecords,
    groups: isGrouped ? groupRecordsByClient(paginatedRecords) : undefined,
    totalCount: records.length,
    pagination: {
      page,
      totalPages: Math.ceil(records.length / limit),
      totalRecords: records.length,
    },
  }
}
