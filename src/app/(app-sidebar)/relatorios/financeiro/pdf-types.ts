// Types for Financial Report PDF

export interface FinancialPdfCompany {
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

export interface FinancialPdfRecord {
  id: string
  clientName: string
  description: string
  dueDate: string | null
  receivedDate: string | null
  value: number
  percentage: number
  status: 'received' | 'confirmed' | 'to_receive' | 'overdue'
}

export interface FinancialPdfGroup {
  clientId: string
  clientName: string
  count: number
  total: number
  percentage: number
  records: FinancialPdfRecord[]
}

export interface FinancialPdfData {
  company: FinancialPdfCompany
  tab: 'receitas' | 'despesas'
  status: string
  totalValue: number
  totalPercentage: number
  groups: FinancialPdfGroup[]
}
