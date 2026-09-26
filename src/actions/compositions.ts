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
    releasedForSale: true,
    variations: [],
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
        kind: 'PROCESS',
        partId: null,
        name: 'Impressão em lona',
        sector: 'Impressão',
        processId: 'impressao-lona',
        setupMinutes: 10,
        estimatedMinutes: 5,
        cost: 1539,
      },
      {
        id: 'st2',
        kind: 'PROCESS',
        partId: null,
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
    id: 'camiseta',
    name: 'Camiseta em malha',
    code: 'PRD-04',
    unit: 'un',
    price: 4900,
    priceRule: 'FIXED',
    releasedForSale: true,
    // A composição muda com o tamanho: mais malha, mais tempo (PV-1)
    variations: [
      { id: 'v-p', name: 'P', price: null, overrides: [] },
      { id: 'v-m', name: 'M', price: null, overrides: [] },
      {
        id: 'v-g',
        name: 'G',
        price: 5200,
        overrides: [{ stepId: 'st5', cost: 2100, estimatedMinutes: 12 }],
      },
      {
        id: 'v-gg',
        name: 'GG',
        price: 5600,
        overrides: [{ stepId: 'st5', cost: 2400, estimatedMinutes: 14 }],
      },
    ],
    fields: [],
    steps: [
      {
        id: 'st5',
        kind: 'PROCESS',
        partId: null,
        name: 'Corte e costura',
        sector: 'Confecção',
        processId: null,
        setupMinutes: 10,
        estimatedMinutes: 10,
        cost: 1800,
      },
      {
        id: 'st6',
        kind: 'PROCESS',
        partId: null,
        name: 'Estampa em sublimação',
        sector: 'Impressão',
        processId: null,
        setupMinutes: 5,
        estimatedMinutes: 6,
        cost: 900,
      },
    ],
  },
  {
    id: 'estrutura-metalon',
    name: 'Estrutura em metalon',
    code: 'PRT-01',
    unit: 'm²',
    price: null,
    priceRule: 'FIXED',
    // Parte: compõe outros produtos e não aparece no orçamento (CP-17)
    releasedForSale: false,
    variations: [],
    fields: [],
    steps: [
      {
        id: 'st4',
        kind: 'PROCESS',
        partId: null,
        name: 'Soldagem',
        sector: 'Serralheria',
        processId: null,
        setupMinutes: 15,
        estimatedMinutes: 40,
        cost: 6200,
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
    releasedForSale: true,
    variations: [],
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
    releasedForSale: true,
    variations: [],
    fields: [],
    steps: [
      {
        id: 'st3',
        kind: 'PROCESS',
        partId: null,
        name: 'Corte e acabamento',
        sector: 'Marcenaria',
        processId: null,
        setupMinutes: 0,
        estimatedMinutes: 30,
        cost: 4200,
      },
    ],
  },
  {
    id: 'cartao',
    name: 'Cartão de visita',
    code: 'PRD-02',
    unit: 'un',
    price: 25,
    priceRule: 'FIXED',
    releasedForSale: true,
    variations: [],
    fields: [],
    steps: [],
  },
  // O exemplo do time (IP-9): a placa em lona leva um quadro de ferro, que
  // é produto próprio, não vendido sozinho — uma parte
  {
    id: 'placa-quadro',
    name: 'Placa em lona com quadro de ferro',
    code: 'PRD-03',
    unit: 'm²',
    price: 18000,
    priceRule: 'FIXED',
    releasedForSale: true,
    variations: [],
    fields: [],
    steps: [],
  },
  {
    id: 'quadro-metalon',
    name: 'Quadro de metalon',
    code: 'PRT-01',
    unit: 'un',
    price: 0,
    priceRule: 'FIXED',
    releasedForSale: false,
    variations: [],
    fields: [],
    steps: [],
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
    releasedForSale: true,
    variations: [],
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

export const updateCompositionStep = async ({
  productId,
  stepId,
  ...values
}: {
  productId: string
  stepId: string
  name?: string
  sector?: string
  estimatedMinutes?: number
  setupMinutes?: number
  cost?: number
}) => {
  const seed = findOrCreate(productId)
  const step = seed.steps.find((item) => item.id === stepId)

  if (!step) {
    return { success: false, data: null, message: 'Etapa não encontrada' }
  }

  if (values.name !== undefined && !values.name.trim()) {
    return { success: false, data: null, message: 'Informe o nome da etapa' }
  }

  const previousName = step.name

  Object.assign(step, values)

  // O campo do produto aponta para a etapa pelo nome: renomear não pode
  // quebrar esse vínculo (IP-4)
  if (values.name && values.name !== previousName) {
    seed.fields.forEach((field) => {
      field.usedBy = field.usedBy.map((name) =>
        name === previousName ? step.name : name,
      )
    })
  }

  return { success: true, data: withCost(seed), message: '' }
}

// A ordem das etapas é a ordem de produção (MS-2): subir e descer importa
export const moveCompositionStep = async ({
  productId,
  stepId,
  direction,
}: {
  productId: string
  stepId: string
  direction: 'UP' | 'DOWN'
}) => {
  const seed = findOrCreate(productId)
  const index = seed.steps.findIndex((item) => item.id === stepId)
  const target = direction === 'UP' ? index - 1 : index + 1

  if (index < 0 || target < 0 || target >= seed.steps.length) {
    return { success: true, data: withCost(seed), message: '' }
  }

  const [step] = seed.steps.splice(index, 1)

  seed.steps.splice(target, 0, step)

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

// Produtos que podem ser usados como PARTE de outro: todos, menos o próprio,
// para não haver produto contendo a si mesmo (IP-9)
export const getAvailableParts = async ({
  productId,
}: {
  productId: string
}) => {
  const data = seeds
    .filter((seed) => seed.id !== productId)
    .map((seed) => ({
      id: seed.id,
      name: seed.name,
      releasedForSale: seed.releasedForSale,
      cost: withCost(seed).cost,
      setupMinutes: seed.steps.reduce(
        (sum, step) => sum + step.setupMinutes,
        0,
      ),
      estimatedMinutes: seed.steps.reduce(
        (sum, step) => sum + step.estimatedMinutes,
        0,
      ),
    }))

  return { success: true, data, message: '' }
}

// A marcação de "liberado para venda" separa o que o vendedor encontra no
// orçamento das partes que só servem para compor (CP-17)
export const setReleasedForSale = async ({
  productId,
  released,
}: {
  productId: string
  released: boolean
}) => {
  const seed = findOrCreate(productId)

  seed.releasedForSale = released

  return { success: true, data: withCost(seed), message: '' }
}

export const addProductVariation = async ({
  productId,
  name,
}: {
  productId: string
  name: string
}) => {
  if (!name?.trim()) {
    return { success: false, data: null, message: 'Informe o nome da variação' }
  }

  const seed = findOrCreate(productId)

  const repeated = seed.variations.some(
    (variation) =>
      variation.name.trim().toLowerCase() === name.trim().toLowerCase(),
  )

  if (repeated) {
    return {
      success: false,
      data: null,
      message: 'Já existe uma variação com esse nome',
    }
  }

  // A variação nasce herdando tudo: nenhuma exceção registrada (PV-2)
  seed.variations.push({
    id: nextFieldId(),
    name: name.trim(),
    price: null,
    overrides: [],
  })

  return { success: true, data: withCost(seed), message: '' }
}

export const removeProductVariation = async ({
  productId,
  variationId,
}: {
  productId: string
  variationId: string
}) => {
  const seed = findOrCreate(productId)

  seed.variations = seed.variations.filter(
    (variation) => variation.id !== variationId,
  )

  return { success: true, data: withCost(seed), message: '' }
}

// Alterar um valor na variação cria a exceção; o que não for alterado
// continua acompanhando a base (PV-2)
export const setVariationOverride = async ({
  productId,
  variationId,
  stepId,
  cost,
  estimatedMinutes,
}: {
  productId: string
  variationId: string
  stepId: string
  cost: number
  estimatedMinutes: number
}) => {
  const seed = findOrCreate(productId)
  const variation = seed.variations.find((item) => item.id === variationId)

  if (!variation) {
    return { success: false, data: null, message: 'Variação não encontrada' }
  }

  const existing = variation.overrides.find((item) => item.stepId === stepId)

  if (existing) {
    existing.cost = cost
    existing.estimatedMinutes = estimatedMinutes
  } else {
    variation.overrides.push({ stepId, cost, estimatedMinutes })
  }

  return { success: true, data: withCost(seed), message: '' }
}

// Desfaz a exceção: a etapa volta a acompanhar a base (PV-2)
export const clearVariationOverride = async ({
  productId,
  variationId,
  stepId,
}: {
  productId: string
  variationId: string
  stepId: string
}) => {
  const seed = findOrCreate(productId)
  const variation = seed.variations.find((item) => item.id === variationId)

  if (!variation) {
    return { success: false, data: null, message: 'Variação não encontrada' }
  }

  variation.overrides = variation.overrides.filter(
    (item) => item.stepId !== stepId,
  )

  return { success: true, data: withCost(seed), message: '' }
}

export const setVariationPrice = async ({
  productId,
  variationId,
  price,
}: {
  productId: string
  variationId: string
  price: number | null
}) => {
  const seed = findOrCreate(productId)
  const variation = seed.variations.find((item) => item.id === variationId)

  if (!variation) {
    return { success: false, data: null, message: 'Variação não encontrada' }
  }

  variation.price = price

  return { success: true, data: withCost(seed), message: '' }
}
