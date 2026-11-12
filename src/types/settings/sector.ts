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
  // Gráfica rápida (12/11/2026): o padrão da contagem de folhas
  bleedMm?: number | null
  setupSheets?: number | null
  nature?: 'PRODUCTIVE' | 'ADMINISTRATIVE'
  // Custo e venda da hora, em centavos (composição). Só vêm para quem tem
  // a permissão de valores
  hourCost?: number | null
  hourSale?: number | null
}

export type ListSectorType = {
  data: ListSectorDataType[]
  total: number
  lastPage: number
}
