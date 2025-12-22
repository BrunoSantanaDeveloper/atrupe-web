// Types for Sales Report PDF

export interface SalesReportPdfCompany {
  name?: string
  cnpj?: string
  logo?: string
  logoUrl?: string
  email?: string
  siteUrl?: string
  phone?: string
  address?: {
    street?: string
    number?: string
    neighborhood?: string
    city?: string
    state?: string
  }
  socialNetworks?: {
    instagram?: string
    facebook?: string
    linkedin?: string
  }
}

export interface SalesReportPdfRecord {
  id: string
  clientName: string
  serviceCode: string
  description: string
  approvedDate: string | null
  phase: string
  value: number
  percentage: number
}

export interface SalesReportPdfGroup {
  clientId: string
  clientName: string
  count: number
  total: number
  percentage: number
  records: SalesReportPdfRecord[]
}

export interface SalesReportPdfData {
  company: SalesReportPdfCompany
  sellerName?: string
  totalValue: number
  totalPercentage: number
  groups: SalesReportPdfGroup[]
}
