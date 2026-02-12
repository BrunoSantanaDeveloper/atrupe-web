// Types
export interface DfcPdfCompany {
  name?: string
  cnpj?: string
  logoUrl?: string
  email?: string
  siteUrl?: string
  phone?: string
  address?: {
    street: string
    number: string
    neighborhood: string
    city: string
    state: string
  }
  socialNetworks?: {
    instagram?: string
    facebook?: string
    linkedin?: string
  }
}

export interface DfcPdfTableRow {
  id: string
  code: string
  name: string
  level: number
  isExpandable: boolean
  parentId?: string
  values: Record<string, number>
}

export interface DfcPdfSummary {
  totalRevenue: number
  totalExpenses: number
  finalCashFlow: number
}

export interface DfcReportPdfData {
  company: DfcPdfCompany
  summary: DfcPdfSummary
  table: {
    headers: string[]
    rows: DfcPdfTableRow[]
  }
}
