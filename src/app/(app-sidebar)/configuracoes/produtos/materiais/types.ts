// Tipos do cadastro de materiais (regras-de-negocio/areas/03-materiais-e-produtos.md).
// Valores em centavos. Espessura e tamanho são materiais diferentes; marca e
// cor são variações (MT-2), e o custo desce até o cruzamento marca × cor (MT-4).

import type { AssetUnit } from '@/app/(app-sidebar)/configuracoes/empresa-e-sistema/patrimonios/types'

export type MaterialUnit = AssetUnit

export type MaterialVariation = {
  id: string
  brand: string
  color: string
  cost: number | null
  price: number | null
}

export type Material = {
  id: string
  code: string
  name: string
  sector: string
  subcategory: string
  unit: MaterialUnit
  directSale: boolean
  productionMaterial: boolean
  priceRule: 'FIXED' | 'VARIABLE'
  // Quando há variação, custo e preço vivem nela (MT-3)
  cost: number | null
  price: number | null
  variations: MaterialVariation[]
  active: boolean
}
