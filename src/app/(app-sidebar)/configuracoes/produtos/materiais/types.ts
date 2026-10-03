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

// Configuração avançada (MT-10.1, decidida em 03/10/2026): as referências
// que as fórmulas, o aproveitamento e o plano de corte leem. Medidas em
// milímetros, peso em quilos. Convenção: a primeira medida do catálogo é X e
// a segunda é Y (50 × 30 → X 50, Y 30); qual lado desconta é escolha de quem
// escreve a fórmula (CP-19)
export type MaterialShape = 'PROFILE' | 'SHEET' | 'OTHER'

export type MaterialAdvanced = {
  shape: MaterialShape
  // Perfil, barra, tubo
  x?: number | null
  y?: number | null
  barLength?: number | null
  // Chapa, folha, bobina
  width?: number | null
  height?: number | null
  // Peso em quilos POR UNIDADE DE VENDA do material (orientação do time,
  // 03/10/2026): a lona vendida por m² tem peso por m², o perfil vendido por
  // metro tem peso por metro, o ilhós tem peso por unidade
  weight?: number | null
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
  advanced?: MaterialAdvanced
}
