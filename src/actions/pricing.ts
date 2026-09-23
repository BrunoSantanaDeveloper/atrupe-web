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
  materials: [
    {
      id: 'lona-branca-x',
      name: 'Lona 440 · Marca X · Branca',
      code: 'MAT-01',
      sector: 'Impressão',
      unit: 'M² – Metro quadrado',
      cost: 1250,
      costUpdatedAt: '2026-09-10',
      rule: 'VARIABLE',
      price: 2800,
      margin: 55.4,
      status: 'PRICED',
    },
    {
      id: 'mdf-10',
      name: 'MDF 10 mm · Marca Y · Branco',
      code: 'MAT-02',
      sector: 'Marcenaria',
      unit: 'UN – Unidade',
      cost: 8900,
      costUpdatedAt: '2026-06-02',
      rule: 'FIXED',
      price: 9500,
      margin: 6.3,
      status: 'PRICED',
    },
    {
      id: 'ilhos',
      name: 'Ilhós',
      code: 'MAT-03',
      sector: 'Produção',
      unit: 'UN – Unidade',
      cost: 12,
      costUpdatedAt: '2026-09-10',
      rule: 'FIXED',
      price: null,
      margin: null,
      status: 'PENDING',
    },
  ],
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
      const list = items[group]

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

export const getPricingItems = async ({
  group,
  filters,
}: {
  group: PricingGroup
  filters?: { [key: string]: string | undefined }
}) => {
  const status = filters?.status
  const search = filters?.search?.trim().toLowerCase()

  const data = items[group]
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
