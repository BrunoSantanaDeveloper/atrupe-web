export type ProductListType = {
  id: string
  name: string
  code: string
  isActive?: boolean
  sectorId?: string | null
  sectorName: string | null
  categoryId?: string | null
  category?: {
    id: string
    name: string
    kind: string
  } | null
  unitOfMeasureCode: string
  unitCost: number
  salePrice: number
  // A composição (CP-17): etapas na composição padrão e a situação dela
  hasComposition?: boolean
  // Produto terceirizado (T-5): comprado de fornecedor e revendido
  isOutsourced?: boolean
  // Os fornecedores do produto terceirizado: o item escolhe de qual compra
  suppliers?: { id: string; name: string }[]
  compositionStatus?: 'DRAFT' | 'RELEASED' | 'PART' | null
  hasVariations?: boolean
  // As variações, para a lista mostrar sob o produto (LITE part3, item 4).
  // Preço em centavos; nulo vale o preço do produto
  variations?: { id: string; name: string; unitPrice: number | null }[]
  fiscalData?: {
    ncm?: string | null
    cest?: string | null
    cfopInState?: string | null
    cfopOutState?: string | null
    icmsCst?: string | null
    pisCst?: string | null
    cofinsCst?: string | null
    codigoServico?: string | null
    aliquotaIss?: number | null
    discriminacao?: string | null
  } | null
  items?: {
    unitCost: number
    salePrice: number
    unitKind: string
    unitOfMeasure: {
      name: string
    }
  }[]
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
  // Quantidade mínima na unidade comercial (0,5 m², 3 un): abaixo dela o
  // item é cobrado pelo mínimo
  minQuantity?: number | null
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
    unitKind: string
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
