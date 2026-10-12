export type ListSectorDataType = {
  id: string
  name: string
  icon: string
  isActive: boolean
  isProductionStage: boolean
  kind: string
  companyId: string
  // Nulo = padrão do ícone (src/consts/sectors.ts)
  color?: string | null
  saleUnit?: 'HOUR' | 'M2' | 'M' | 'UN' | 'KM'
  nature?: 'PRODUCTIVE' | 'ADMINISTRATIVE'
}

export type ListSectorType = {
  data: ListSectorDataType[]
  total: number
  lastPage: number
}
