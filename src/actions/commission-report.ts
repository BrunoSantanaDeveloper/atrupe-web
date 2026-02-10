'use server'

import type {
  CommissionSummary,
  CommissionTableData,
  CommissionRecord,
  CommissionGroup,
  CommissionType,
  CommissionGroupBy,
  CommissionOrderBy,
} from '@/app/(app-sidebar)/relatorios/comissoes/types'

interface CommissionSummaryFilters {
  commissionType?: CommissionType
  startDate?: string
  endDate?: string
}

interface CommissionTableFilters {
  commissionType?: CommissionType
  startDate?: string
  endDate?: string
  groupBy?: CommissionGroupBy
  orderBy?: CommissionOrderBy
  page?: number
  limit?: number
}

// ============================================
// MOCK DATA - Remover quando backend estiver pronto
// ============================================

const MOCK_SUMMARY: CommissionSummary = {
  salesTotal: 4898125,
  salesCount: 230,
  receivedTotal: 2500080,
  receivedCount: 180,
  commissionTotal: 278242,
}

function generateMockRecords(count: number): CommissionRecord[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `record-${i + 100}`,
    clientName: 'Nome do Cliente Ltda',
    description: `${108 - i}-v1 - ${i === 0 ? 'Venda rápida' : 'Descrição do serviço'}`,
    saleDate: '00/00/0000',
    receivedDate: '00/00/0000',
    saleValue: i === 0 ? 5000000 : 500000,
    receivedValue: i === 0 ? 5000000 : 500000,
    percentage: 14,
  }))
}

const MOCK_GROUPS: CommissionGroup[] = [
  {
    vendedorId: 'v1',
    vendedorName: 'Nome do Vendedor',
    count: 4,
    saleTotal: 450000,
    receivedTotal: 450000,
    records: generateMockRecords(4),
  },
  {
    vendedorId: 'v2',
    vendedorName: 'Nome do Vendedor',
    count: 40,
    saleTotal: 450000,
    receivedTotal: 450000,
    records: generateMockRecords(6),
  },
]

// ============================================
// SERVER ACTIONS
// ============================================

export async function getCommissionSummary(
  _filters?: CommissionSummaryFilters,
): Promise<CommissionSummary> {
  // TODO: Replace with real API call
  await new Promise((resolve) => setTimeout(resolve, 500))
  return MOCK_SUMMARY
}

export async function getCommissionTable(
  _filters?: CommissionTableFilters,
): Promise<CommissionTableData> {
  // TODO: Replace with real API call
  await new Promise((resolve) => setTimeout(resolve, 600))

  const groupBy = _filters?.groupBy || 'vendedor'

  if (groupBy === 'none') {
    return {
      grouped: false,
      records: generateMockRecords(10),
      groups: [],
      totalCount: 230,
      pagination: {
        page: _filters?.page || 1,
        totalPages: 10,
      },
    }
  }

  return {
    grouped: true,
    records: [],
    groups: MOCK_GROUPS,
    totalCount: 230,
    pagination: {
      page: _filters?.page || 1,
      totalPages: 10,
    },
  }
}
