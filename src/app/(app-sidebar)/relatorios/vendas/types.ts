// Types for Sales Report page
// Ready for backend integration

export type SalesOrderBy =
  | 'approvedDate'
  | 'deliveryDate'
  | 'valueDesc'
  | 'valueAsc'

// Qual data o período filtra na tabela/PDF/Excel (cards e gráficos seguem
// sempre a aprovação)
export type SalesPeriodBy = 'approvedAt' | 'deliveryDate'

export interface SalesReportFilters {
  sellerId: string | null
  originId: string | null
  clientId: string | null
  serieId: string | null
  period:
    | 'current_month'
    | 'last_month'
    | 'last_3_months'
    | 'last_6_months'
    | 'custom'
  startDate: Date | null
  endDate: Date | null
  groupBy: 'none' | 'client' | 'seller'
  orderBy: SalesOrderBy
  periodBy: SalesPeriodBy
}

export interface SalesSummary {
  approvedTotal: number
  approvedCount: number
  rejectedTotal: number
  rejectedCount: number
  noResponseTotal: number
  noResponseCount: number
  expiredTotal: number
  expiredCount: number
  canceledTotal: number
  canceledCount: number
  averageTicket: number
  commission: number
  approvalTime: string // e.g., "48h35"
}

export interface SalesEvolutionData {
  day: string
  approved: number
  count: number
}

export interface SalesEvolutionYearSeries {
  year: number
  data: { month: string; approved: number; count: number }[]
}

export interface SalesEvolutionResponse {
  mode: 'daily' | 'monthly' | 'yearly'
  data: SalesEvolutionData[]
  yearlyData: SalesEvolutionYearSeries[]
}

export interface ApprovedRejectedData {
  label: string
  approved: number
  canceled: number
  expired: number
  rejected: number
}

export interface OriginChartData {
  name: string
  value: number
  color: string
}

export interface LossByReasonData {
  id: string | null
  reason: string
  count: number
  /** Em centavos, como o resto do relatório */
  value: number
}

export interface LossesByReasonData {
  rejections: LossByReasonData[]
  cancellations: LossByReasonData[]
}

export interface TopProductData {
  name: string
  type: string
  value: number
}

export interface TopClientData {
  name: string
  value: number
}

export type SalePhase = 'em-producao' | 'entregue' | 'aguardando' | 'cancelada'

export interface SaleRecord {
  id: string
  osNumber: string
  clientName: string
  clientCity: string | null
  serviceDescription: string
  approvedDate: string | null
  deliveryDate: string | null
  dueDate: string
  value: number
  phase: SalePhase
  phasePercentage: number
}

// Grouped by client - returned when groupBy = 'client'
export interface SalesClientGroup {
  clientId: string
  clientName: string
  count: number
  total: number
  records: SaleRecord[]
}

// Grouped by seller - returned when groupBy = 'seller'
export interface SalesSellerGroup {
  sellerId: string
  sellerName: string
  count: number
  total: number
  records: SaleRecord[]
}

// Table data can be either flat (no grouping), grouped by client, or grouped by seller
// `totalValue` é o total do período inteiro (todas as páginas), base da
// porcentagem exibida na tabela
export type SalesTableData =
  | {
      grouped: false
      records: SaleRecord[]
      totalCount: number
      totalValue: number
    }
  | {
      grouped: true
      groups: (SalesClientGroup | SalesSellerGroup)[]
      totalCount: number
      totalValue: number
    }

export interface SalesReportData {
  summary: SalesSummary
  evolution: SalesEvolutionData[]
  approvedRejected: ApprovedRejectedData[]
  quotationsOrigin: OriginChartData[]
  ordersOrigin: OriginChartData[]
  topProducts: TopProductData[]
  topClients: TopClientData[]
  tableData: SalesTableData
  pagination: {
    page: number
    totalPages: number
    totalRecords: number
  }
}

// Helper type for API response
export interface SalesReportApiResponse {
  success: boolean
  data: SalesReportData
}

// Conversão por origem e por vendedor (CRM-6, 27/10/2026)
export interface ConversionRow {
  id: string | null
  name: string
  quotations: number
  approved: number
  value: number
  rate: number
  averageDays: number | null
}
export interface ConversionData {
  byOrigin: ConversionRow[]
  bySeller: ConversionRow[]
}

// Clientes sem compra há N dias (CRM-4, 27/10/2026)
export interface InactiveClientRow {
  id: string
  name: string
  phone: string | null
  purchases: number
  total: number
  lastPurchaseAt: string | null
  daysSince: number | null
  lastQuotation: {
    id: string
    reference: string
    description: string | null
    value: number
  } | null
}
export interface InactiveClientsData {
  days: number
  clients: InactiveClientRow[]
}
