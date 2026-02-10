'use server'

// Types
import type {
  DfcSummary,
  DfcCashFlowDataPoint,
  DfcRevenueExpenseDataPoint,
  DfcTableData,
} from '@/app/(app-sidebar)/relatorios/dfc/types'

// Mock data - valores em centavos
const MOCK_SUMMARY: DfcSummary = {
  totalRevenue: 14898125, // R$ 148.981,25
  totalExpenses: -2786405, // -R$ 27.864,05
  finalCashFlow: 12102720, // R$ 121.027,20
}

const MOCK_CASH_FLOW_CHART: DfcCashFlowDataPoint[] = [
  { month: '2025-07', label: 'Jul 25', positive: 0, negative: -250000 },
  { month: '2025-08', label: 'Ago 25', positive: 0, negative: -180000 },
  { month: '2025-09', label: 'Set 25', positive: 1075000, negative: 0 },
  { month: '2025-10', label: 'Out 25', positive: 0, negative: -120000 },
  { month: '2025-11', label: 'Nov 25', positive: 0, negative: -200000 },
  { month: '2025-12', label: 'Dez 25', positive: 0, negative: -150000 },
]

const MOCK_REVENUE_EXPENSE_CHART: DfcRevenueExpenseDataPoint[] = [
  { month: '2025-07', label: 'Jul 25', revenue: 0, expenses: 0 },
  { month: '2025-08', label: 'Ago 25', revenue: 0, expenses: 0 },
  { month: '2025-09', label: 'Set 25', revenue: 1075000, expenses: 234500 },
  { month: '2025-10', label: 'Out 25', revenue: 1075000, expenses: 234500 },
  { month: '2025-11', label: 'Nov 25', revenue: 0, expenses: 0 },
  { month: '2025-12', label: 'Dez 25', revenue: 0, expenses: 0 },
]

const MOCK_TABLE_DATA: DfcTableData = {
  headers: ['Jan 25', 'Fev 25', 'Mar 25', 'Abr 25', 'Mai 25', 'Jun 25'],
  rows: [
    // Receitas (level 0)
    {
      id: 'receitas',
      code: '',
      name: 'Receitas',
      level: 0,
      isExpandable: true,
      values: {
        'Jan 25': 4050000,
        'Fev 25': 4050000,
        'Mar 25': 4050000,
        'Abr 25': 4050000,
        'Mai 25': 4050000,
        'Jun 25': 4050000,
      },
    },
    // 01 - Administrativo (level 1)
    {
      id: '01-admin',
      code: '01',
      name: 'Administrativo',
      level: 1,
      isExpandable: true,
      parentId: 'receitas',
      values: {
        'Jan 25': 0,
        'Fev 25': 0,
        'Mar 25': 0,
        'Abr 25': 0,
        'Mai 25': 0,
        'Jun 25': 0,
      },
    },
    // 02 - Operacional (level 1)
    {
      id: '02-oper',
      code: '02',
      name: 'Operacional',
      level: 1,
      isExpandable: true,
      parentId: 'receitas',
      values: {
        'Jan 25': 4050000,
        'Fev 25': 4050000,
        'Mar 25': 4050000,
        'Abr 25': 4050000,
        'Mai 25': 4050000,
        'Jun 25': 4050000,
      },
    },
    // 01.02.01 - Vendas (level 2)
    {
      id: '01.02.01-vendas',
      code: '01.02.01',
      name: 'Vendas',
      level: 2,
      isExpandable: true,
      parentId: '02-oper',
      values: {
        'Jan 25': 1050000,
        'Fev 25': 1050000,
        'Mar 25': 1050000,
        'Abr 25': 1050000,
        'Mai 25': 1050000,
        'Jun 25': 1050000,
      },
    },
    // Items (level 3)
    {
      id: '01.02.01.01',
      code: '01.02.01.01',
      name: 'Prestação de Serviços',
      level: 3,
      isExpandable: false,
      parentId: '01.02.01-vendas',
      values: {
        'Jan 25': 500000,
        'Fev 25': 500000,
        'Mar 25': 500000,
        'Abr 25': 500000,
        'Mai 25': 500000,
        'Jun 25': 500000,
      },
    },
    {
      id: '01.02.01.02',
      code: '01.02.01.02',
      name: 'Venda de Mercadorias',
      level: 3,
      isExpandable: false,
      parentId: '01.02.01-vendas',
      values: {
        'Jan 25': 500000,
        'Fev 25': 500000,
        'Mar 25': 500000,
        'Abr 25': 500000,
        'Mai 25': 500000,
        'Jun 25': 500000,
      },
    },
    {
      id: '01.02.01.03',
      code: '01.02.01.03',
      name: 'Receita de Aluguéis',
      level: 3,
      isExpandable: false,
      parentId: '01.02.01-vendas',
      values: {
        'Jan 25': 500000,
        'Fev 25': 500000,
        'Mar 25': 500000,
        'Abr 25': 500000,
        'Mai 25': 500000,
        'Jun 25': 500000,
      },
    },
    {
      id: '01.02.01.04',
      code: '01.02.01.04',
      name: 'Receita Diversas',
      level: 3,
      isExpandable: false,
      parentId: '01.02.01-vendas',
      values: {
        'Jan 25': 500000,
        'Fev 25': 500000,
        'Mar 25': 500000,
        'Abr 25': 500000,
        'Mai 25': 500000,
        'Jun 25': 500000,
      },
    },
    {
      id: '01.02.01.05',
      code: '01.02.01.05',
      name: 'Descontos Recebidos',
      level: 3,
      isExpandable: false,
      parentId: '01.02.01-vendas',
      values: {
        'Jan 25': 500000,
        'Fev 25': 500000,
        'Mar 25': 500000,
        'Abr 25': 500000,
        'Mai 25': 500000,
        'Jun 25': 500000,
      },
    },
    {
      id: '01.02.01.06',
      code: '01.02.01.06',
      name: 'Juros Recebidos',
      level: 3,
      isExpandable: false,
      parentId: '01.02.01-vendas',
      values: {
        'Jan 25': 500000,
        'Fev 25': 500000,
        'Mar 25': 500000,
        'Abr 25': 500000,
        'Mai 25': 500000,
        'Jun 25': 500000,
      },
    },
    // Não Operacional (level 1)
    {
      id: 'nao-oper',
      code: '',
      name: 'Não Operacional',
      level: 1,
      isExpandable: true,
      parentId: 'receitas',
      values: {
        'Jan 25': 4050000,
        'Fev 25': 4050000,
        'Mar 25': 4050000,
        'Abr 25': 4050000,
        'Mai 25': 4050000,
        'Jun 25': 4050000,
      },
    },
    // Despesas (level 0)
    {
      id: 'despesas',
      code: '',
      name: 'Despesas',
      level: 0,
      isExpandable: true,
      values: {
        'Jan 25': -4050000,
        'Fev 25': -4050000,
        'Mar 25': -4050000,
        'Abr 25': -4050000,
        'Mai 25': -4050000,
        'Jun 25': -4050000,
      },
    },
    // 01 - Administrativo (Despesas)
    {
      id: 'desp-01-admin',
      code: '01',
      name: 'Administrativo',
      level: 1,
      isExpandable: true,
      parentId: 'despesas',
      values: {
        'Jan 25': -4050000,
        'Fev 25': -4050000,
        'Mar 25': -4050000,
        'Abr 25': -4050000,
        'Mai 25': -4050000,
        'Jun 25': -4050000,
      },
    },
    // 02 - Operacional (Despesas)
    {
      id: 'desp-02-oper',
      code: '02',
      name: 'Operacional',
      level: 1,
      isExpandable: true,
      parentId: 'despesas',
      values: {
        'Jan 25': -4050000,
        'Fev 25': -4050000,
        'Mar 25': -4050000,
        'Abr 25': -4050000,
        'Mai 25': -4050000,
        'Jun 25': -4050000,
      },
    },
    // Não Operacional (Despesas)
    {
      id: 'desp-nao-oper',
      code: '',
      name: 'Não Operacional',
      level: 1,
      isExpandable: true,
      parentId: 'despesas',
      values: {
        'Jan 25': -4050000,
        'Fev 25': -4050000,
        'Mar 25': -4050000,
        'Abr 25': -4050000,
        'Mai 25': -4050000,
        'Jun 25': -4050000,
      },
    },
  ],
}

export async function getDfcSummary(): Promise<DfcSummary> {
  // TODO: Replace with actual API call
  return MOCK_SUMMARY
}

export async function getDfcCashFlowChart(): Promise<DfcCashFlowDataPoint[]> {
  // TODO: Replace with actual API call
  return MOCK_CASH_FLOW_CHART
}

export async function getDfcRevenueExpenseChart(): Promise<
  DfcRevenueExpenseDataPoint[]
> {
  // TODO: Replace with actual API call
  return MOCK_REVENUE_EXPENSE_CHART
}

export async function getDfcTable(): Promise<DfcTableData> {
  // TODO: Replace with actual API call
  return MOCK_TABLE_DATA
}
