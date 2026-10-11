'use server'

// PROVISÓRIO: a API ainda não tem os endpoints da Precificação (recurso do
// PRO). Estas actions devolvem dados de exemplo em memória, no mesmo formato
// `{ success, data, message }` das actions reais.

// Types
import type {
  PriceRule,
  PricingItem,
  PricingGroup,
  PricingSummary,
  PricingParameters,
} from '@/app/(app-sidebar)/precificacao/types'

// Os materiais vêm do cadastro (DC-6: a Precificação é a segunda porta para
// o mesmo dado). Com variação, a linha é a variação (MT-3)
import { materials, materialUnitSymbol } from './materials-data'
// O custo da máquina acompanha o rateio manual do setor (BC-3.1)
import { SETUP_BY_RESOURCE, allocatedUnitCost } from './sector-allocation-data'

const REFERENCE_MONTH = '2026-08'

// Percentuais em décimos de ponto: 60 = 6,0%
const parameters: PricingParameters = {
  taxation: 60,
  commission: 30,
  financialCost: 15,
  desiredMargin: 300,
  markup: 0,
}

const withMarkup = (params: PricingParameters): PricingParameters => {
  const charges =
    (params.taxation +
      params.commission +
      params.financialCost +
      params.desiredMargin) /
    1000

  return {
    ...params,
    // Método divisor (D3 §7.2): 1 ÷ (1 − encargos)
    markup: charges >= 1 ? 0 : Math.round((1 / (1 - charges)) * 100) / 100,
  }
}

const items: { [key in PricingGroup]: PricingItem[] } = {
  labor: [
    {
      id: 'producao',
      name: 'Produção',
      code: 'MO-01',
      sector: 'Produção',
      unit: 'HR – Hora',
      cost: 1649,
      costUpdatedAt: '2026-08-31',
      rule: 'FIXED',
      price: 6000,
      margin: 72.5,
      status: 'PRICED',
    },
    {
      id: 'criacao',
      name: 'Criação',
      code: 'MO-02',
      sector: 'Criação',
      unit: 'HR – Hora',
      cost: 3623,
      costUpdatedAt: '2026-08-31',
      rule: 'FIXED',
      price: 3000,
      margin: -20.8,
      status: 'BELOW_COST',
    },
    {
      id: 'marcenaria',
      name: 'Marcenaria',
      code: 'MO-03',
      sector: 'Marcenaria',
      unit: 'HR – Hora',
      cost: null,
      costUpdatedAt: null,
      rule: 'FIXED',
      price: 3500,
      margin: null,
      status: 'NO_COST',
    },
  ],
  machines: [
    {
      id: 'sublimatica-standart',
      name: 'Impressora Sublimática · Standart',
      code: 'MAQ-01',
      sector: 'Impressão',
      unit: 'M² – Metro quadrado',
      cost: 152,
      costUpdatedAt: '2026-08-31',
      rule: 'VARIABLE',
      price: 447,
      margin: 66.0,
      status: 'PRICED',
    },
    {
      id: 'solvente-4passes',
      name: 'Impressora Solvente · 4 passes',
      code: 'MAQ-02',
      sector: 'Impressão',
      unit: 'M² – Metro quadrado',
      cost: 289,
      costUpdatedAt: '2026-08-31',
      rule: 'VARIABLE',
      price: null,
      margin: null,
      status: 'PENDING',
    },
    {
      id: 'frota-motos',
      name: 'Motos (grupo)',
      code: 'MAQ-03',
      sector: 'Frota',
      unit: 'KM – Quilometragem',
      cost: 120,
      costUpdatedAt: '2026-07-31',
      rule: 'FIXED',
      price: 350,
      margin: 65.7,
      status: 'PRICED',
    },
  ],
  // Materiais: ver materialPricingItems()
  materials: [],
  products: [
    {
      id: 'banner',
      name: 'Banner 440 com bastão',
      code: 'PRD-01',
      sector: 'Impressão',
      unit: 'M² – Metro quadrado',
      cost: 1890,
      costUpdatedAt: '2026-09-10',
      rule: 'FIXED',
      price: 4500,
      margin: 58.0,
      status: 'PRICED',
    },
    {
      id: 'adesivo',
      name: 'Adesivo recortado',
      code: 'PRD-02',
      sector: 'Impressão',
      unit: 'M² – Metro quadrado',
      cost: null,
      costUpdatedAt: null,
      rule: 'FIXED',
      price: 3500,
      margin: null,
      status: 'NO_COST',
    },
    {
      id: 'placa-pvc',
      name: 'Placa PVC 3 mm',
      code: 'PRD-03',
      sector: 'Marcenaria',
      unit: 'UN – Unidade',
      cost: 4200,
      costUpdatedAt: '2026-08-15',
      rule: 'FIXED',
      price: 3900,
      margin: -7.7,
      status: 'BELOW_COST',
    },
  ],
}

export const getPricingSummary = async () => {
  const data: PricingSummary = {
    referenceMonth: REFERENCE_MONTH,
    parameters: withMarkup(parameters),
    groups: (Object.keys(items) as PricingGroup[]).map((group) => {
      const list = group === 'machines' ? machinePricingItems() : items[group]

      return {
        group,
        total: list.length,
        priced: list.filter((item) => item.price !== null).length,
        pending: list.filter((item) => item.price === null).length,
        belowCost: list.filter((item) => item.status === 'BELOW_COST').length,
      }
    }),
  }

  return { success: true, data, message: '' }
}

const marginOf = (cost: number | null, price: number | null) =>
  cost !== null && price
    ? Math.round(((price - cost) / price) * 1000) / 10
    : null

const statusOf = (cost: number | null, price: number | null) => {
  if (cost === null) return 'NO_COST' as const
  if (!price) return 'PENDING' as const
  return price < cost ? ('BELOW_COST' as const) : ('PRICED' as const)
}

// A máquina que é configuração produtiva de um patrimônio tem o custo pelo
// rateio do setor; com o critério manual, o custo e a margem mudam juntos
const machinePricingItems = (): PricingItem[] =>
  items.machines.map((item) => {
    const setupId = SETUP_BY_RESOURCE[item.id]
    if (!setupId || item.cost === null) return item

    const cost = allocatedUnitCost(setupId, item.cost)
    if (cost === item.cost) return item

    return {
      ...item,
      cost,
      margin: marginOf(cost, item.price),
      status: statusOf(cost, item.price),
    }
  })

// Um item por variação (ou por material sem variação), com o mesmo id que a
// composição usa para o recurso: "mat:<material>[:<variação>]"
const materialPricingItems = (): PricingItem[] =>
  materials
    .filter((material) => material.active)
    .flatMap((material) => {
      const unit = materialUnitSymbol(material.unit)
      if (material.variations.length) {
        return material.variations.map((variation) => ({
          id: `mat:${material.id}:${variation.id}`,
          name: `${material.name} · ${variation.brand} ${variation.color}`.trim(),
          code: material.code,
          sector: material.sector,
          unit,
          cost: variation.cost,
          costUpdatedAt: null,
          rule: material.priceRule,
          price: variation.price,
          margin: marginOf(variation.cost, variation.price),
          status: statusOf(variation.cost, variation.price),
        }))
      }
      return [
        {
          id: `mat:${material.id}`,
          name: material.name,
          code: material.code,
          sector: material.sector,
          unit,
          cost: material.cost,
          costUpdatedAt: null,
          rule: material.priceRule,
          price: material.price,
          margin: marginOf(material.cost, material.price),
          status: statusOf(material.cost, material.price),
        },
      ]
    })

export const getPricingItems = async ({
  group,
  filters,
}: {
  group: PricingGroup
  filters?: { [key: string]: string | undefined }
}) => {
  const status = filters?.status
  const search = filters?.search?.trim().toLowerCase()

  const source =
    group === 'materials'
      ? materialPricingItems()
      : group === 'machines'
        ? machinePricingItems()
        : items[group]
  const data = source
    .filter((item) => !status || status === 'todos' || item.status === status)
    .filter((item) => !search || item.name.toLowerCase().includes(search))

  return { success: true, data, message: '' }
}

export const updatePricingParameters = async (
  values: Omit<PricingParameters, 'markup'>,
) => {
  Object.assign(parameters, values)

  return { success: true, data: withMarkup(parameters), message: '' }
}

export const updateItemPrice = async ({
  group,
  id,
  rule,
  price,
}: {
  group: PricingGroup
  id: string
  rule: PriceRule
  price: number
}) => {
  // Material: grava no cadastro, na variação quando houver (MT-3, DC-6)
  if (group === 'materials') {
    const [, materialId, variationId] = id.split(':')
    const material = materials.find((current) => current.id === materialId)
    const variation = variationId
      ? material?.variations.find((current) => current.id === variationId)
      : null
    if (!material || (variationId && !variation)) {
      return { success: false, data: null, message: 'Item não encontrado' }
    }
    const target = variation || material
    if (target.cost === null) {
      return {
        success: false,
        data: null,
        message: 'Este item ainda não tem custo.',
      }
    }
    target.price = price
    material.priceRule = rule
    const item = materialPricingItems().find((current) => current.id === id)
    return { success: true, data: item || null, message: '' }
  }

  const item = items[group].find((current) => current.id === id)

  if (!item) {
    return { success: false, data: null, message: 'Item não encontrado' }
  }

  if (item.cost === null) {
    return {
      success: false,
      data: null,
      message: 'Este item ainda não tem custo calculado.',
    }
  }

  item.rule = rule
  item.price = price
  item.margin = price
    ? Math.round(((price - item.cost) / price) * 1000) / 10
    : null
  item.status =
    item.margin !== null && item.margin < 0 ? 'BELOW_COST' : 'PRICED'

  return { success: true, data: item, message: '' }
}
