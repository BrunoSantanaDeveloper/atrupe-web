export type ProductListType = {
  id: string
  name: string
  code: string
  sectorName: string
  unitOfMeasureCode: string
  unitCost: number
  salePrice: number
}

export type ProductType = {
  id: string
  name: string
  code: string
  status: 'ACTIVE' | 'INACTIVE'
  isStandard: boolean
  technicalDescription: string
  allowEditValues: boolean
  allowEditDescription: boolean
  imageUrl: string
  productionStages: {
    id: string
    isAcive: boolean
  }[]
  categoryId: string
  sector: {
    id: string
    name: string
  }
  items: {
    id: string
    name: string
    productId: string
    unitOfMeasureId: string
    width: number
    height: number
    length: number
    weight: number
    volume: number
    distance: number
    duration: number
    unitCost: number
    salePrice: number
  }[]
  unitOfMeasure: {
    id: string
    code: string
    name: string
  }
  unitCost: number
  salePrice: number
}

export type ListProductsType = {
  data: ProductListType[]
  total: number
}
