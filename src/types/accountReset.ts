/** "Zerar dados da conta" (superadmin). */

export interface ResetOptions {
  includeFiscalDocuments: boolean
  restoreDefaults: boolean
}

export interface ResetPreviewGroup {
  group:
    | 'documents'
    | 'registries'
    | 'financial'
    | 'payroll'
    | 'fiscal'
    | 'settings'
  label: string
  optional: boolean
  included: boolean
  items: { label: string; count: number }[]
  total: number
}

export interface ResetPreview {
  company: { id: string; name: string; cnpj: string | null }
  options: ResetOptions
  groups: ResetPreviewGroup[]
  totalToDelete: number
  kept: {
    users: number
    employees: number
    digitalCertificates: number
    subscription: {
      plan: string
      status: string
      value: number
      cycle: string
    } | null
  }
}

export interface ResetSummaryItem {
  model: string
  label: string | null
  group: string | null
  count: number
}

export interface ResetResult {
  resetId: string
  companyId: string
  companyName: string
  options: ResetOptions
  summary: ResetSummaryItem[]
  total: number
  backupExpiresAt: string
  defaultsRestored: boolean
  warning: string | null
}

export interface CompanyResetRecord {
  id: string
  createdAt: string
  createdByName: string
  options: ResetOptions
  summary: ResetSummaryItem[]
  backupExpiresAt: string | null
  backupAvailable: boolean
}
