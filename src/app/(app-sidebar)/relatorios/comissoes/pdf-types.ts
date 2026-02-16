// Types for Commission Report PDF / Excel

export interface CommissionPdfRecord {
  id: string
  clientName: string
  description: string
  saleDate: string
  receivedDate: string
  saleValue: number
  receivedValue: number
  percentage: number
}

export interface CommissionPdfGroup {
  vendedorId: string
  vendedorName: string
  count: number
  saleTotal: number
  receivedTotal: number
  records: CommissionPdfRecord[]
}

export interface CommissionPdfData {
  company: {
    name?: string
    cnpj?: string
    logo?: string
    logoUrl?: string
    email?: string
    phone?: string
    siteUrl?: string
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
  totalSaleValue: number
  totalReceivedValue: number
  groups: CommissionPdfGroup[]
}
