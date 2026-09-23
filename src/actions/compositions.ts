'use server'

// PROVISÓRIO: a API ainda não tem os endpoints da composição (recurso do PRO).
// Dados de exemplo em memória, no formato das actions reais.

// Types
import type {
  CompositionStep,
  ProductComposition,
} from '@/app/(app-sidebar)/configuracoes/produtos/composicoes/types'

// Markup de referência da empresa, vindo da Precificação (PR-1)
const REFERENCE_MARKUP = 1.68

type Seed = Omit<ProductComposition, 'cost' | 'margin' | 'suggestedPrice'>

const seeds: Seed[] = [
  {
    id: 'banner',
    name: 'Banner 440 com bastão',
    code: 'PRD-01',
    unit: 'm²',
    price: 4500,
    priceRule: 'FIXED',
    steps: [
      {
        id: 'st1',
        name: 'Impressão em lona',
        sector: 'Impressão',
        processId: 'impressao-lona',
        estimatedMinutes: 5,
        cost: 1539,
      },
      {
        id: 'st2',
        name: 'Acabamento de banner',
        sector: 'Produção',
        processId: 'acabamento-banner',
        estimatedMinutes: 15,
        cost: 436,
      },
    ],
  },
  {
    id: 'adesivo',
    name: 'Adesivo recortado',
    code: 'PRD-02',
    unit: 'm²',
    price: 3500,
    priceRule: 'FIXED',
    steps: [],
  },
  {
    id: 'placa-pvc',
    name: 'Placa PVC 3 mm',
    code: 'PRD-03',
    unit: 'un',
    price: 3900,
    priceRule: 'FIXED',
    steps: [
      {
        id: 'st3',
        name: 'Corte e acabamento',
        sector: 'Marcenaria',
        processId: null,
        estimatedMinutes: 30,
        cost: 4200,
      },
    ],
  },
]

const withCost = (seed: Seed): ProductComposition => {
  const cost = seed.steps.length
    ? seed.steps.reduce((sum, step) => sum + step.cost, 0)
    : null

  return {
    ...seed,
    cost,
    // Produto sem composição nunca aparece como margem zero (DC-15)
    margin:
      cost !== null && seed.price
        ? Math.round(((seed.price - cost) / seed.price) * 1000) / 10
        : null,
    suggestedPrice: cost !== null ? Math.round(cost * REFERENCE_MARKUP) : null,
  }
}

export const getCompositions = async ({
  filters,
}: {
  filters?: { [key: string]: string | undefined }
}) => {
  const search = filters?.search?.trim().toLowerCase()
  const status = filters?.status

  const data = seeds
    .map(withCost)
    .filter((product) => {
      if (status === 'sem-composicao') return !product.steps.length
      if (status === 'com-composicao') return product.steps.length > 0
      if (status === 'abaixo-do-custo')
        return product.margin !== null && product.margin < 0

      return true
    })
    .filter((product) => !search || product.name.toLowerCase().includes(search))

  return { success: true, data, message: '' }
}

export const getComposition = async ({ id }: { id: string }) => {
  const seed = seeds.find((item) => item.id === id)

  if (!seed) {
    return { success: false, data: null, message: 'Produto não encontrado' }
  }

  return { success: true, data: withCost(seed), message: '' }
}

export const addCompositionStep = async ({
  productId,
  step,
}: {
  productId: string
  step: Omit<CompositionStep, 'id'>
}) => {
  const seed = seeds.find((item) => item.id === productId)

  if (!seed) {
    return { success: false, data: null, message: 'Produto não encontrado' }
  }

  seed.steps.push({ ...step, id: `step-${Date.now()}` })

  return { success: true, data: withCost(seed), message: '' }
}

export const removeCompositionStep = async ({
  productId,
  stepId,
}: {
  productId: string
  stepId: string
}) => {
  const seed = seeds.find((item) => item.id === productId)

  if (!seed) {
    return { success: false, data: null, message: 'Produto não encontrado' }
  }

  seed.steps = seed.steps.filter((step) => step.id !== stepId)

  return { success: true, data: withCost(seed), message: '' }
}

// A decisão de preço é produto a produto: manter o praticado ou adotar o
// sugerido (DC-14). O preço praticado continua livre.
export const applySuggestedPrice = async ({ id }: { id: string }) => {
  const seed = seeds.find((item) => item.id === id)
  const product = seed ? withCost(seed) : null

  if (!seed || !product?.suggestedPrice) {
    return {
      success: false,
      data: null,
      message: 'Produto sem custo calculado',
    }
  }

  seed.price = product.suggestedPrice

  return { success: true, data: withCost(seed), message: '' }
}
