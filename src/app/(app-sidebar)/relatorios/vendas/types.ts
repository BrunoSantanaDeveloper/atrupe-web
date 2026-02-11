// Types for Sales Report page
// Ready for backend integration

export interface SalesReportFilters {
  sellerId: string | null
  originId: string | null
  period:
    | 'current_month'
    | 'last_month'
    | 'last_3_months'
    | 'last_6_months'
    | 'custom'
  startDate: Date | null
  endDate: Date | null
  groupBy: 'none' | 'client' | 'seller'
  orderBy: 'approvedDate' | 'valueDesc' | 'valueAsc'
}

export interface SalesSummary {
  approvedTotal: number
  approvedCount: number
  rejectedTotal: number
  rejectedCount: number
  noResponseTotal: number
  noResponseCount: number
  averageTicket: number
  commission: number
  approvalTime: string // e.g., "48h35"
}

export interface SalesEvolutionData {
  day: string
  approved: number
}

export interface ApprovedRejectedData {
  label: string
  approved: number
  expired: number
  rejected: number
}

export interface OriginChartData {
  name: string
  value: number
  color: string
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

export type SalePhase = 'em-producao' | 'entregue' | 'aguardando'

export interface SaleRecord {
  id: string
  clientName: string
  serviceDescription: string
  approvedDate: string | null
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
export type SalesTableData =
  | { grouped: false; records: SaleRecord[]; totalCount: number }
  | {
      grouped: true
      groups: (SalesClientGroup | SalesSellerGroup)[]
      totalCount: number
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
