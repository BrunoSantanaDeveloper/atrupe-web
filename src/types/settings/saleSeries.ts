export type SaleSeriesType = {
  id: string
  createdAt: string
  updatedAt: string
  isActive: boolean
  code: string
  description: string
  title: string
  currentBudgetNumber: number
  proposalValidity: number
  deliveryDeadline: number
  billing: {
    value: string
    label: string
  }
  sendToProduction: {
    value: string
    label: string
  }
  productionStatus: {
    value: string
    label: string
  }
  // Textos da proposta próprios da série; null usa os da empresa.
  textBeforeItems: string | null
  textAfterItems: string | null
  companyId: string
  isTraining: boolean
  isDefault: boolean
  allowedProfiles: { id: string; name: string }[]
}

export type ListSaleSeriessType = {
  data: SaleSeriesType[]
  total: number
  page: number
  limit: number
}
