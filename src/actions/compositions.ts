'use server'

// PROVISÓRIO: a API ainda não tem os endpoints da composição (recurso do PRO).
// Dados de exemplo em memória, no formato das actions reais.

// Types
import type {
  ProductField,
  CompositionStep,
  ProductComposition,
} from '@/app/(app-sidebar)/configuracoes/produtos/[id]/composicao/types'

// Markup de referência da empresa, vindo da Precificação (PR-1)
const REFERENCE_MARKUP = 1.68

type Seed = Omit<ProductComposition, 'cost' | 'margin' | 'suggestedPrice'>

const nextFieldId = () =>
  `field-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

const seeds: Seed[] = [
  {
    id: 'banner',
    name: 'Banner 440 com bastão',
    code: 'PRD-01',
    unit: 'm²',
    price: 4500,
    priceRule: 'FIXED',
    fields: [
      {
        id: 'f1',
        name: 'Ilhoses por metro',
        defaultValue: 2,
        usedBy: ['Acabamento de banner'],
      },
    ],
    steps: [
      {
        id: 'st1',
        name: 'Impressão em lona',
        sector: 'Impressão',
        processId: 'impressao-lona',
        setupMinutes: 10,
        estimatedMinutes: 5,
        cost: 1539,
      },
      {
        id: 'st2',
        name: 'Acabamento de banner',
        sector: 'Produção',
        processId: 'acabamento-banner',
        setupMinutes: 10,
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
    fields: [],
    steps: [],
  },
  {
    id: 'placa-pvc',
    name: 'Placa PVC 3 mm',
    code: 'PRD-03',
    unit: 'un',
    price: 3900,
    priceRule: 'FIXED',
    fields: [],
    steps: [
      {
        id: 'st3',
        name: 'Corte e acabamento',
        sector: 'Marcenaria',
        processId: null,
        setupMinutes: 0,
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

// O produto vem do cadastro que a empresa já usa (CP-16): qualquer produto
// pode ser aberto, mesmo sem composição nenhuma. Enquanto a API não existe,
// um produto desconhecido ganha uma composição vazia em memória.
const findOrCreate = (id: string): Seed => {
  const seed = seeds.find((item) => item.id === id)

  if (seed) return seed

  const created: Seed = {
    id,
    name: 'Produto',
    code: '',
    unit: 'un',
    price: null,
    priceRule: 'FIXED',
    fields: [],
    steps: [],
  }

  seeds.push(created)

  return created
}

export const getComposition = async ({ id }: { id: string }) => {
  return { success: true, data: withCost(findOrCreate(id)), message: '' }
}

export const addCompositionStep = async ({
  productId,
  step,
  fields = [],
}: {
  productId: string
  step: Omit<CompositionStep, 'id'>
  fields?: { name: string; defaultValue: number }[]
}) => {
  const seed = findOrCreate(productId)

  seed.steps.push({ ...step, id: `step-${Date.now()}` })

  // Campo com o mesmo nome não nasce de novo: a etapa passa a usar o que já
  // existe, que é o que impede o mesmo número virar três campos (IP-4)
  fields.forEach((incoming) => {
    const existing = seed.fields.find(
      (field) =>
        field.name.trim().toLowerCase() === incoming.name.trim().toLowerCase(),
    )

    if (existing) {
      if (!existing.usedBy.includes(step.name)) existing.usedBy.push(step.name)

      return
    }

    seed.fields.push({
      id: nextFieldId(),
      name: incoming.name.trim(),
      defaultValue: incoming.defaultValue,
      usedBy: [step.name],
    })
  })

  return { success: true, data: withCost(seed), message: '' }
}

export const removeCompositionStep = async ({
  productId,
  stepId,
}: {
  productId: string
  stepId: string
}) => {
  const seed = findOrCreate(productId)
  const removed = seed.steps.find((step) => step.id === stepId)

  seed.steps = seed.steps.filter((step) => step.id !== stepId)

  // O campo continua existindo, mas deixa de ser usado por esta etapa
  if (removed) {
    seed.fields.forEach((field) => {
      field.usedBy = field.usedBy.filter((name) => name !== removed.name)
    })
  }

  return { success: true, data: withCost(seed), message: '' }
}

// A decisão de preço é produto a produto: manter o praticado ou adotar o
// sugerido (DC-14). O preço praticado continua livre.
export const applySuggestedPrice = async ({ id }: { id: string }) => {
  const seed = findOrCreate(id)
  const product = withCost(seed)

  if (!product.suggestedPrice) {
    return {
      success: false,
      data: null,
      message: 'Produto sem custo calculado',
    }
  }

  seed.price = product.suggestedPrice

  return { success: true, data: withCost(seed), message: '' }
}

// Os campos do orçamento são do PRODUTO, não de cada processo: um nome, um
// valor, um lugar para preencher (IP-4 e IP-6)
export const addProductField = async ({
  productId,
  name,
  defaultValue,
}: {
  productId: string
  name: string
  defaultValue: number
}) => {
  if (!name?.trim()) {
    return { success: false, data: null, message: 'Informe o nome do campo' }
  }

  const seed = findOrCreate(productId)

  const repeated = seed.fields.some(
    (field) => field.name.trim().toLowerCase() === name.trim().toLowerCase(),
  )

  if (repeated) {
    return {
      success: false,
      data: null,
      message: 'Já existe um campo com esse nome neste produto',
    }
  }

  const field: ProductField = {
    id: nextFieldId(),
    name: name.trim(),
    defaultValue,
    usedBy: [],
  }

  seed.fields.push(field)

  return { success: true, data: withCost(seed), message: '' }
}

export const updateProductField = async ({
  productId,
  fieldId,
  ...values
}: {
  productId: string
  fieldId: string
  name?: string
  defaultValue?: number
}) => {
  const seed = findOrCreate(productId)
  const field = seed.fields.find((item) => item.id === fieldId)

  if (!field) {
    return { success: false, data: null, message: 'Campo não encontrado' }
  }

  if (values.name !== undefined && !values.name.trim()) {
    return { success: false, data: null, message: 'Informe o nome do campo' }
  }

  Object.assign(field, values)

  return { success: true, data: withCost(seed), message: '' }
}

export const removeProductField = async ({
  productId,
  fieldId,
}: {
  productId: string
  fieldId: string
}) => {
  const seed = findOrCreate(productId)
  const field = seed.fields.find((item) => item.id === fieldId)

  if (field?.usedBy.length) {
    return {
      success: false,
      data: null,
      message: `Este campo é usado por ${field.usedBy.join(', ')}`,
    }
  }

  seed.fields = seed.fields.filter((item) => item.id !== fieldId)

  return { success: true, data: withCost(seed), message: '' }
}
