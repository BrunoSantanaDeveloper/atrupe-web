// Types for Sector Report PDF/Excel export

export interface SectorPdfCompany {
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

export interface SectorPdfSector {
  id: string
  name: string
  icon: string
  value: number
}

export interface SectorReportPdfData {
  company: SectorPdfCompany
  sectors: SectorPdfSector[]
  generalTotal: number
}
