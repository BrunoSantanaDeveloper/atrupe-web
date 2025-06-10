export type ListSectorDataType = {
  id: string
  name: string
  icon: string
  isActive: boolean
  isProductionStage: boolean
  kind: string
  companyId: string
}

export type ListSectorType = {
  data: ListSectorDataType[]
  total: number
  lastPage: number
}
