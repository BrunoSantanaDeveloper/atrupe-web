// Types for Products Sold Report PDF/Excel export

import type { ProductSold } from './types'

export interface ProductsPdfCompany {
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

export interface ProductsReportPdfData {
  company: ProductsPdfCompany
  period: { start: string; end: string }
  products: ProductSold[]
  totalValue: number
}
