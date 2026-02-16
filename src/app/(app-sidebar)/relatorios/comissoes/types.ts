// Types for Commission Report (Comissões)

export type CommissionType = 'all' | 'sold_value' | 'received_value'

export type CommissionGroupBy =
  | 'vendedor'
  | 'saleDate'
  | 'receivedDate'
  | 'none'

export type CommissionOrderBy =
  | 'receivedDate'
  | 'saleDate'
  | 'valueDesc'
  | 'valueAsc'

export interface CommissionSummary {
  salesTotal: number
  salesCount: number
  receivedTotal: number
  receivedCount: number
  commissionTotal: number
}

export interface CommissionRecord {
  id: string
  clientName: string
  description: string
  saleDate: string
  receivedDate: string
  saleValue: number
  receivedValue: number
  percentage: number
}

export interface CommissionGroup {
  vendedorId: string
  vendedorName: string
  count: number
  saleTotal: number
  receivedTotal: number
  records: CommissionRecord[]
}

export interface CommissionTableData {
  grouped: boolean
  records: CommissionRecord[]
  groups: CommissionGroup[]
  totalCount: number
  pagination: {
    page: number
    totalPages: number
  }
}
