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
  // Cobrar a folha inteira ou só a fração aproveitada (AP-4, 05/10/2026).
  // Padrão: inteira; a etapa do produto pode trocar
  wholeSheets?: boolean
  // Peso em quilos POR UNIDADE DE VENDA do material (orientação do time,
  // 03/10/2026): a lona vendida por m² tem peso por m², o perfil vendido por
  // metro tem peso por metro, o ilhós tem peso por unidade
  weight?: number | null
}

// Os dados fiscais da venda direta (NCM, CFOP, CSTs), com o módulo Nota Fiscal
export type MaterialFiscal = Partial<{
  ncm: string
  cest: string
  cean: string
  commercialUnit: string
  icmsOrigin: string
  icmsCst: string
  pisCst: string
  cofinsCst: string
  ipiCst: string
  cfopInState: string
  cfopOutState: string
}>

export type Material = {
  id: string
  code: string
  name: string
  // O setor do cadastro (/sector): o id e o nome, que a lista agrupa
  sectorId: string
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
  // Os dados fiscais da venda direta, com o módulo Nota Fiscal: o que
  // ficar vazio sai do padrão do emissor na nota (PO, 14/10/2026)
  fiscal?: MaterialFiscal
}
