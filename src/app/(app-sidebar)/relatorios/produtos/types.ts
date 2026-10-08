// Types for Products Sold Report

export interface ProductSold {
  productId: string
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
