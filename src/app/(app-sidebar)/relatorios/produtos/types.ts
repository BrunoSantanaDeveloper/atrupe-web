// Types for Products Sold Report

export interface ProductSold {
  // Nulo no material de venda direta e no item montado na hora (Fase 4.4)
  productId: string | null
  // Produto, Material ou Item montado
  type?: string
  name: string
  quantity: number
  /** Unidade comercial vinda do backend: M2, UN, M, KG… */
  unit: string
  value: number
}

export interface ProductsSoldData {
  products: ProductSold[]
  totalValue: number
}
