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
  textBeforeItems: string
  textAfterItems: string
  companyId: string
  isTraining: boolean
}

export type ListSaleSeriessType = {
  data: SaleSeriesType[]
  total: number
  page: number
  limit: number
}
