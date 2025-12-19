// Types for Sales Report page
// Ready for backend integration

export interface SalesReportFilters {
  sellerId: string | null
  origin: string | null
  period:
    | 'current_month'
    | 'last_month'
    | 'last_3_months'
    | 'last_6_months'
    | 'custom'
  startDate: Date | null
  endDate: Date | null
}

export interface SalesSummary {
  approvedTotal: number
  approvedCount: number
  rejectedTotal: number
  rejectedCount: number
  noResponseTotal: number
  averageTicket: number
  commission: number
  approvalTime: string // e.g., "48h35"
}

export interface SalesEvolutionData {
  month: string
  approved: number
  inProgress: number
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
  type: 'PDF' | 'Excel' | string
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

export interface SalesTableSection {
  title: string
  count: number
  total: number
  records: SaleRecord[]
}

export interface SalesReportData {
  summary: SalesSummary
  evolution: SalesEvolutionData[]
  approvedRejected: ApprovedRejectedData[]
  quotationsOrigin: OriginChartData[]
  ordersOrigin: OriginChartData[]
  topProducts: TopProductData[]
  topClients: TopClientData[]
  tableSections: SalesTableSection[]
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
