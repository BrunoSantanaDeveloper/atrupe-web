'use server'

// PROVISÓRIO: a API ainda não tem os endpoints da composição no orçamento
// (recurso do PRO). Dados de exemplo em memória, no formato das actions reais.

// Types
import type {
  AddOption,
  Quotation,
  QuotationItem,
  QuotationLine,
  ItemComposition,
  ComposedItemSummary,
} from '@/app/(app-sidebar)/vendas/orcamentos/[quotationId]/composicao/types'

// Actions
import { getProcessDetail, resolveComposedItem } from './product-assembly'

// Os materiais de venda direta entram na busca do orçamento (ORG-1)
import { materials } from './materials-data'

/* ---------------------------------------------------------------------------
 * O item montado na hora (ORC-11): o vendedor monta o fluxo com o mesmo
 * editor do produto, só naquele item. A linha guarda o retrato da venda
 * (ORC-10) com o custo; a tela do orçamento recebe só o resumo, sem custo
 * (ORC-7)
 * ------------------------------------------------------------------------- */

const newId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

const num = (value: number) =>
  value.toLocaleString('pt-BR', { maximumFractionDigits: 3 })

const quotations: Quotation[] = [
  {
    id: 'demo',
    reference: 'ORC-2026-0184',
    client: 'Supermercado Bom Preço',
    items: [
      {
        id: 'item-1',
        name: 'Lona com bainha e ilhós',
        origin: 'LIBRARY',
        sector: 'Impressão',
        quantity: 1,
        width: 3,
        height: 1,
        fields: [{ name: 'Distância entre ilhoses', value: 0.5 }],
        variation: null,
        discount: 0,
        price: null,
        lines: [
          {
            id: 'line-1',
            kind: 'PROCESS',
            name: 'Impressão em lona',
            sector: 'Impressão',
            tags: ['3 x 1 = 3 m²', 'Impressora Solvente · 4 passes'],
            cost: 4617,
            price: 7757,
            resolvedAt: '2026-09-20T09:14:00',
            resolved: [
              {
                id: 'rr1',
                kind: 'MACHINE',
                name: 'Impressora Solvente · 4 passes',
                unit: 'm²',
                quantity: 3,
                unitCost: 289,
                cost: 867,
                actualQuantity: null,
                actualCost: null,
              },
              {
                id: 'rr2',
                kind: 'MATERIAL',
                name: 'Lona 440 · Branca',
                unit: 'm²',
                quantity: 3,
                unitCost: 1250,
                cost: 3750,
                actualQuantity: null,
                actualCost: null,
              },
            ],
          },
          {
            id: 'line-2',
            kind: 'PROCESS',
            name: 'Acabamento de banner',
            sector: 'Produção',
            tags: ['3 m²', 'Ilhoses: 16'],
            cost: 1308,
            price: 2198,
            resolvedAt: '2026-09-20T09:14:00',
            resolved: [
              {
                id: 'rr3',
                kind: 'MATERIAL',
                name: 'Ilhós',
                unit: 'un',
                quantity: 16,
                unitCost: 12,
                cost: 192,
                actualQuantity: null,
                actualCost: null,
              },
              {
                id: 'rr4',
                kind: 'LABOR',
                name: 'Produção',
                unit: 'h',
                quantity: 0.68,
                unitCost: 1649,
                cost: 1116,
                actualQuantity: null,
                actualCost: null,
              },
            ],
          },
        ],
      },
      {
        id: 'item-2',
        name: 'Letreiro em acrílico',
        origin: 'COMPOSED',
        sector: 'CNC',
        quantity: 1,
        width: 2,
        height: 0.4,
        fields: [
          { name: 'Número de letras', value: 8 },
          { name: 'Perímetro', value: 12 },
        ],
        variation: null,
        discount: 5000,
        price: null,
        lines: [
          {
            id: 'line-3',
            kind: 'PROCESS',
            name: 'Corte em router',
            sector: 'CNC',
            tags: ['0,8 m²', 'Perímetro: 12 m'],
            cost: 18400,
            price: 30912,
            resolvedAt: '2026-09-21T16:02:00',
            resolved: [
              {
                id: 'rr5',
                kind: 'MACHINE',
                name: 'Router · 1 passe',
                unit: 'm²',
                quantity: 0.8,
                unitCost: 4120,
                cost: 3296,
                actualQuantity: null,
                actualCost: null,
              },
              {
                id: 'rr6',
                kind: 'MATERIAL',
                name: 'Acrílico 6 mm',
                unit: 'm²',
                quantity: 0.8,
                unitCost: 15000,
                cost: 12000,
                actualQuantity: null,
                actualCost: null,
              },
              {
                id: 'rr7',
                kind: 'LABOR',
                name: 'CNC',
                unit: 'h',
                quantity: 1,
                unitCost: 3104,
                cost: 3104,
                actualQuantity: null,
                actualCost: null,
              },
            ],
          },
          {
            id: 'line-4',
            kind: 'PART',
            name: 'Estrutura em metalon',
            sector: 'Parte do produto',
            tags: ['2 x 0,4'],
            cost: 6200,
            price: 10416,
            resolvedAt: '2026-09-21T16:02:00',
            resolved: [
              {
                id: 'rr8',
                kind: 'MATERIAL',
                name: 'Metalon 20x20',
                unit: 'm',
                quantity: 4.8,
                unitCost: 780,
                cost: 3744,
                actualQuantity: null,
                actualCost: null,
              },
              {
                id: 'rr9',
                kind: 'LABOR',
                name: 'Serralheria',
                unit: 'h',
                quantity: 1.2,
                unitCost: 2047,
                cost: 2456,
                actualQuantity: null,
                actualCost: null,
              },
            ],
          },
          {
            id: 'line-5',
            kind: 'LOOSE',
            name: 'Pintura eletrostática',
            sector: 'Terceirizado · Pinta Bem',
            tags: ['avulso'],
            cost: 9000,
            price: 15120,
            resolvedAt: '2026-09-21T16:02:00',
            resolved: [
              {
                id: 'rr10',
                kind: 'OUTSOURCED',
                name: 'Pintura eletrostática · Pinta Bem',
                unit: 'un',
                quantity: 1,
                unitCost: 9000,
                cost: 9000,
                actualQuantity: null,
                actualCost: null,
              },
            ],
          },
        ],
      },
    ],
  },
]

const find = (quotationId: string) => {
  const quotation = quotations.find((item) => item.id === quotationId)

  if (quotation) return quotation

  const created: Quotation = {
    id: quotationId,
    reference: quotationId.toUpperCase(),
    client: 'Cliente',
    items: [],
  }

  quotations.push(created)

  return created
}

// Quais orçamentos abertos usam este produto (PAD-7, regra do Maicol em
// 05/10/2026): inativar ou excluir um produto marca os orçamentos abertos que
// o têm, e eles não podem ser aprovados até o item ser trocado ou retirado.
// O bloqueio da aprovação é da rotina do orçamento; esta função responde a
// lista para ela e para o diálogo de inativar. Aberto é o que não foi
// aprovado nem fechado
export const getOpenQuotationsUsingProduct = async ({
  productId,
}: {
  productId: string
}) =>
  ({
    success: true,
    message: '',
    data: quotations
      .filter((quotation) => !quotation.status || quotation.status === 'OPEN')
      .flatMap((quotation) =>
        quotation.items
          .filter((item) => item.productId === productId)
          .map((item) => ({
            quotationId: quotation.id,
            reference: quotation.reference,
            client: quotation.client,
            itemId: item.id,
            itemName: item.name,
          })),
      ),
  }) as const

export const getQuotation = async ({ id }: { id: string }) => {
  return { success: true, data: find(id), message: '' }
}

// O que o vendedor encontra ao acrescentar UM ITEM ao orçamento: produtos
// liberados para venda, organizados por setor (ORC-1)
export const getQuotationProducts = async () => {
  const data: AddOption[] = [
    {
      id: 'banner',
      name: 'Banner 440 com bastão',
      sector: 'Impressão',
      unit: 'm²',
      price: 4500,
      releasedForSale: true,
      measured: true,
      hasComposition: true,
      fields: [{ name: 'Ilhoses por metro', defaultValue: 2 }],
    },
    {
      id: 'placa-quadro',
      name: 'Placa em lona com quadro de ferro',
      sector: 'Impressão',
      unit: 'm²',
      price: 18000,
      releasedForSale: true,
      measured: true,
      hasComposition: true,
    },
    {
      id: 'adesivo',
      name: 'Adesivo recortado',
      sector: 'Impressão',
      unit: 'm²',
      price: 3500,
      releasedForSale: true,
      measured: true,
    },
    {
      id: 'cartao',
      name: 'Cartão de visita · 1000 un',
      sector: 'Gráfica Rápida',
      unit: 'un',
      price: 12000,
      releasedForSale: true,
      hasComposition: true,
      // A variação também serve para as cores de impressão (PV-7): 4x4 é
      // frente e verso, então cada folha passa duas vezes pela máquina
      variations: [
        { id: '4x0', name: '4x0', price: null },
        { id: '4x1', name: '4x1', price: 13500 },
        { id: '4x4', name: '4x4', price: 15800 },
      ],
    },
    {
      id: 'placa-pvc',
      name: 'Placa PVC 3 mm',
      sector: 'CNC',
      unit: 'un',
      price: 3900,
      releasedForSale: true,
      measured: true,
      fields: [{ name: 'Número de furos', defaultValue: 4 }],
    },
    {
      id: 'camiseta',
      name: 'Camiseta em malha',
      sector: 'Confecção',
      unit: 'un',
      price: 4900,
      releasedForSale: true,
      // O tamanho é escolhido ao acrescentar e muda a composição (PV-5)
      variations: [
        { id: 'p', name: 'P', price: null },
        { id: 'm', name: 'M', price: null },
        { id: 'g', name: 'G', price: 5200 },
        { id: 'gg', name: 'GG', price: 5600 },
      ],
    },
    {
      id: 'instalacao-dia',
      name: 'Instalação · diária',
      sector: 'Instalação',
      unit: 'un',
      price: 38000,
      releasedForSale: true,
    },
  ]

  return { success: true, data, message: '' }
}

// O que se acrescenta DENTRO de um item: processos por setor e partes
// (produtos não liberados para venda). O terceirizado avulso entra pelo
// formulário próprio (T-4)
export const getItemOptions = async () => {
  const processes: AddOption[] = [
    {
      id: 'impressao-lona',
      name: 'Impressão em lona',
      sector: 'Impressão',
      unit: 'm²',
      price: 2585,
    },
    {
      id: 'acabamento-banner',
      name: 'Acabamento de banner',
      sector: 'Produção',
      unit: 'm²',
      price: 733,
    },
    {
      id: 'corte-router',
      name: 'Corte em router',
      sector: 'CNC',
      unit: 'm²',
      price: 38640,
    },
    {
      id: 'instalacao-obra',
      name: 'Instalação em obra',
      sector: 'Instalação',
      unit: 'un',
      price: 30240,
    },
  ]

  const parts: AddOption[] = [
    {
      id: 'estrutura-metalon',
      name: 'Estrutura em metalon',
      sector: 'Serralheria',
      unit: 'm²',
      price: 10416,
      releasedForSale: false,
    },
  ]

  return { success: true, data: { processes, parts }, message: '' }
}

export const addQuotationItem = async ({
  quotationId,
  option,
  width,
  height,
  quantity,
  discount = 0,
  fields = [],
  variation = null,
  composition,
}: {
  quotationId: string
  option: AddOption
  width: number
  height: number
  quantity: number
  discount?: number
  fields?: { name: string; value: number }[]
  variation?: string | null
  composition?: ItemComposition
}) => {
  const quotation = find(quotationId)

  const item: QuotationItem = {
    id: newId('item'),
    name: option.name,
    productId: option.hasComposition ? option.id : undefined,
    composition,
    origin: 'LIBRARY',
    sector: option.sector,
    quantity,
    width,
    height,
    fields,
    variation,
    discount,
    // A variação pode ter preço próprio; sem ele, vale o do produto (PV-4)
    price:
      option.variations?.find((item) => item.name === variation)?.price ??
      option.price,
    lines: [],
  }

  quotation.items.push(item)

  return { success: true, data: quotation, message: '' }
}

export const addQuotationLine = async ({
  quotationId,
  itemId,
  line,
}: {
  quotationId: string
  itemId: string
  line: Omit<QuotationLine, 'id'>
}) => {
  const quotation = find(quotationId)
  const item = quotation.items.find((current) => current.id === itemId)

  if (!item) {
    return { success: false, data: null, message: 'Item não encontrado' }
  }

  item.lines.push({ ...line, id: newId('line') })
  // A partir do momento em que o item tem composição, o preço é a soma dela
  item.price = null

  return { success: true, data: quotation, message: '' }
}

export const updateQuotationItem = async ({
  quotationId,
  itemId,
  ...values
}: {
  quotationId: string
  itemId: string
  width?: number
  height?: number
  quantity?: number
  discount?: number
  fields?: { name: string; value: number }[]
  variation?: string | null
  composition?: ItemComposition
}) => {
  const quotation = find(quotationId)
  const item = quotation.items.find((current) => current.id === itemId)

  if (!item) {
    return { success: false, data: null, message: 'Item não encontrado' }
  }

  Object.assign(item, values)

  return { success: true, data: quotation, message: '' }
}

export const removeQuotationLine = async ({
  quotationId,
  itemId,
  lineId,
}: {
  quotationId: string
  itemId: string
  lineId: string
}) => {
  const quotation = find(quotationId)
  const item = quotation.items.find((current) => current.id === itemId)

  if (!item) {
    return { success: false, data: null, message: 'Item não encontrado' }
  }

  item.lines = item.lines.filter((line) => line.id !== lineId)

  return { success: true, data: quotation, message: '' }
}

export const removeQuotationItem = async ({
  quotationId,
  itemId,
}: {
  quotationId: string
  itemId: string
}) => {
  const quotation = find(quotationId)

  quotation.items = quotation.items.filter((item) => item.id !== itemId)

  return { success: true, data: quotation, message: '' }
}

/* ---------------------------------------------------------------------------
 * O que se acrescenta DENTRO de um item já lançado (ORC-5, 05/10/2026): como
 * no legado, o item é um recipiente aberto, que recebe processos e
 * terceirizados depois de lançado. Provisório: fica aqui, por item, até a API
 * guardar as linhas no item e recalcular o valor dele (backend-pendente.md)
 * ------------------------------------------------------------------------- */

const itemLines = new Map<string, QuotationLine[]>()

export const getItemLines = async ({
  quotationId,
}: {
  quotationId: string
}) => {
  const data: Record<string, QuotationLine[]> = {}
  itemLines.forEach((lines, key) => {
    const [quotation, itemId] = key.split('::')
    if (quotation === quotationId) data[itemId] = lines
  })
  return { success: true, data, message: '' }
}

export const addItemLine = async ({
  quotationId,
  itemId,
  line,
}: {
  quotationId: string
  itemId: string
  line: Omit<QuotationLine, 'id'>
}) => {
  if (!line.name.trim())
    return { success: false, data: null, message: 'Informe o que acrescentar' }
  const key = `${quotationId}::${itemId}`
  itemLines.set(key, [
    ...(itemLines.get(key) || []),
    { ...line, id: newId('line') },
  ])
  return { success: true, data: null, message: '' }
}

// Mudar a medida de um item já composto (decisão de 05/10/2026): as linhas
// que acompanham a base são recalculadas com a medida nova; as de medida
// própria ficam como estão. Diferente do legado, que avisava e não mexia
export const recalculateItemLines = async ({
  quotationId,
  itemId,
  measure,
}: {
  quotationId: string
  itemId: string
  measure: { quantity: number; width: number; height: number }
}) => {
  const key = `${quotationId}::${itemId}`
  const lines = itemLines.get(key) || []
  let changed = 0
  const next: QuotationLine[] = []
  for (const line of lines) {
    if (!line.followsBase) {
      next.push(line)
      continue
    }
    if (line.kind === 'PROCESS' && line.processId) {
      const res = await getProcessDetail({
        processId: line.processId,
        measure,
      })
      if (!res.success || !res.data) {
        next.push(line)
        continue
      }
      changed += 1
      next.push({
        ...line,
        measure,
        tags: measureTags(measure),
        cost: res.data.cost ?? 0,
        price: res.data.sale ?? 0,
        resolvedAt: new Date().toISOString(),
      })
      continue
    }
    if (line.kind === 'PART' && line.measure) {
      // A parte do catálogo: o preço por unidade de venda vale para a
      // medida nova (preço ÷ medida antiga × medida nova)
      const before = partMeasure(line.measure)
      const after = partMeasure(measure)
      const unitPrice = before > 0 ? line.price / before : 0
      changed += 1
      next.push({
        ...line,
        measure,
        tags: measureTags(measure),
        price: Math.round(unitPrice * after),
        cost: Math.round((before > 0 ? line.cost / before : 0) * after),
        resolvedAt: new Date().toISOString(),
      })
      continue
    }
    next.push(line)
  }
  itemLines.set(key, next)
  return { success: true, data: { changed }, message: '' }
}

const measureTags = (measure: {
  quantity: number
  width: number
  height: number
}) => [
  `${num(measure.quantity)} un`,
  `${num(measure.width)} × ${num(measure.height)} m`,
]

// A parte do catálogo vendida por área cobra quantidade × área; por unidade,
// só a quantidade. A linha guarda a medida; a unidade está nas etiquetas
const partMeasure = (measure: {
  quantity: number
  width: number
  height: number
}) => measure.quantity * (measure.width || 1) * (measure.height || 1)

export const removeItemLine = async ({
  quotationId,
  itemId,
  lineId,
}: {
  quotationId: string
  itemId: string
  lineId: string
}) => {
  const key = `${quotationId}::${itemId}`
  itemLines.set(
    key,
    (itemLines.get(key) || []).filter((line) => line.id !== lineId),
  )
  return { success: true, data: null, message: '' }
}

/* ---------------------------------------------------------------------------
 * Composição do item no orçamento do sistema (IP-36, ORC-3). O item é gravado
 * pela API de sempre; o que o vendedor escolheu na composição fica aqui até a
 * API receber o campo `composition` no item (backend-pendente.md)
 * ------------------------------------------------------------------------- */

const itemCompositions = new Map<string, ItemComposition>()

export const saveItemComposition = async ({
  quotationId,
  key,
  composition,
}: {
  quotationId: string
  // Id do item; ao criar, sem o id de volta, o id do produto
  key: string
  composition: ItemComposition
}) => {
  itemCompositions.set(`${quotationId}:${key}`, composition)
  return { success: true, data: null, message: '' }
}

export const getItemCompositions = async ({
  quotationId,
}: {
  quotationId: string
}) => {
  const data: Record<string, ItemComposition> = {}
  itemCompositions.forEach((value, key) => {
    const [quotation, item] = key.split(':')
    if (quotation === quotationId) data[item] = value
  })
  return { success: true, data, message: '' }
}

type ComposedRecord = ComposedItemSummary & {
  quotationId: string
  lines: QuotationLine[]
}

const composedItems: ComposedRecord[] = []

const resolveLines = async (
  draftId: string,
  measure: { quantity: number; width: number; height: number },
): Promise<QuotationLine[]> => {
  const res = await resolveComposedItem({ productId: draftId, measure })
  if (!res.success || !res.data) return []
  const resolvedAt = new Date().toISOString()
  return res.data.map((stage) => ({
    id: newId('line'),
    kind: stage.kind,
    name: stage.name,
    sector: stage.sector,
    tags: [
      `${num(stage.measure.quantity)} un`,
      stage.measure.width && stage.measure.height
        ? `${num(stage.measure.width)} x ${num(stage.measure.height)} m`
        : '',
    ].filter(Boolean),
    cost: stage.cost,
    price: stage.sale,
    resolvedAt,
    resolved: stage.resolved.map((resource) => ({
      ...resource,
      actualQuantity: null,
      actualCost: null,
    })),
  }))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const summaryOf = ({ quotationId, lines, ...summary }: ComposedRecord) =>
  summary

const buildRecord = async (
  base: Omit<
    ComposedRecord,
    'origin' | 'stages' | 'sectors' | 'price' | 'attention' | 'lines'
  >,
): Promise<ComposedRecord> => {
  const lines = await resolveLines(base.draftId, {
    quantity: base.quantity,
    width: base.width,
    height: base.height,
  })
  return {
    ...base,
    origin: 'COMPOSED',
    lines,
    stages: lines.length,
    sectors: Array.from(new Set(lines.map((line) => line.sector))),
    price: lines.reduce((sum, line) => sum + line.price, 0),
    attention: lines.length === 0,
  }
}

/* ---------------------------------------------------------------------------
 * Material de venda direta como item do orçamento (ORG-1, decisão de
 * 05/10/2026): aparece na busca junto dos produtos, marcado como material, e
 * vira item simples com a unidade e o preço do material (ou da variação).
 * Como a API só aceita produto no item, fica aqui, no mesmo registro dos
 * itens montados na hora, com a origem marcada (backend-pendente.md)
 * ------------------------------------------------------------------------- */

const UNIT_LABEL: Record<string, string> = {
  HR: 'h',
  M2: 'm²',
  M: 'm',
  KM: 'km',
  UN: 'un',
  KG: 'kg',
  LT: 'l',
}

export type DirectSaleMaterial = {
  id: string
  code: string
  name: string
  sector: string
  unit: string
  // Preço por unidade de venda, em centavos; vazio quando só as variações
  // têm preço
  price: number | null
  variations: { id: string; name: string; price: number | null }[]
}

export const getDirectSaleMaterials = async () => {
  const data: DirectSaleMaterial[] = materials
    .filter((material) => material.active && material.directSale)
    .map((material) => ({
      id: material.id,
      code: material.code,
      name: material.name,
      sector: material.sector,
      unit: UNIT_LABEL[material.unit] || material.unit.toLowerCase(),
      price: material.price,
      variations: material.variations.map((variation) => ({
        id: variation.id,
        name: [variation.brand, variation.color].filter(Boolean).join(' · '),
        price: variation.price,
      })),
    }))
  return { success: true, data, message: '' }
}

const materialRecord = ({
  id,
  quotationId,
  material,
  variationId,
  quantity,
}: {
  id: string
  quotationId: string
  material: DirectSaleMaterial
  variationId: string | null
  quantity: number
}): ComposedRecord | null => {
  const variation = variationId
    ? material.variations.find((item) => item.id === variationId)
    : null
  const unitPrice = variation?.price ?? material.price
  if (unitPrice === null || unitPrice === undefined) return null
  return {
    id,
    origin: 'MATERIAL',
    quotationId,
    draftId: '',
    materialId: material.id,
    variationId,
    unit: material.unit,
    unitPrice,
    name: variation ? `${material.name} · ${variation.name}` : material.name,
    description: `Material · ${material.sector}`,
    quantity: Math.max(1, quantity),
    width: 0,
    height: 0,
    lines: [],
    stages: 0,
    sectors: [material.sector],
    price: Math.round(unitPrice * Math.max(1, quantity)),
    attention: false,
  }
}

export const addMaterialItem = async ({
  quotationId,
  materialId,
  variationId = null,
  quantity,
}: {
  quotationId: string
  materialId: string
  variationId?: string | null
  quantity: number
}) => {
  const material = (await getDirectSaleMaterials()).data.find(
    (item) => item.id === materialId,
  )
  if (!material) {
    return { success: false, data: null, message: 'Material não encontrado' }
  }
  if (material.variations.length && !variationId) {
    return {
      success: false,
      data: null,
      message: 'Escolha a variação do material',
    }
  }
  const record = materialRecord({
    id: newId('item'),
    quotationId,
    material,
    variationId,
    quantity,
  })
  if (!record) {
    return {
      success: false,
      data: null,
      message: 'Este material está sem preço de venda',
    }
  }
  composedItems.push(record)
  return { success: true, data: summaryOf(record), message: '' }
}

export const updateMaterialItem = async ({
  quotationId,
  itemId,
  variationId = null,
  quantity,
}: {
  quotationId: string
  itemId: string
  variationId?: string | null
  quantity: number
}) => {
  const index = composedItems.findIndex(
    (item) =>
      item.quotationId === quotationId &&
      item.id === itemId &&
      item.origin === 'MATERIAL',
  )
  if (index < 0) {
    return { success: false, data: null, message: 'Item não encontrado' }
  }
  const current = composedItems[index]
  const material = (await getDirectSaleMaterials()).data.find(
    (item) => item.id === current.materialId,
  )
  if (!material) {
    return { success: false, data: null, message: 'Material não encontrado' }
  }
  const record = materialRecord({
    id: current.id,
    quotationId,
    material,
    variationId: variationId ?? current.variationId ?? null,
    quantity,
  })
  if (!record) {
    return {
      success: false,
      data: null,
      message: 'Este material está sem preço de venda',
    }
  }
  composedItems[index] = record
  return { success: true, data: summaryOf(record), message: '' }
}

export const addComposedItem = async ({
  quotationId,
  draftId,
  name,
  description,
  quantity,
  width,
  height,
}: {
  quotationId: string
  draftId: string
  name: string
  description: string
  quantity: number
  width: number
  height: number
}) => {
  if (!name.trim()) {
    return { success: false, data: null, message: 'Informe o nome do item' }
  }
  const record = await buildRecord({
    id: newId('item'),
    quotationId,
    draftId,
    name: name.trim(),
    description: description.trim(),
    quantity: Math.max(1, quantity),
    width,
    height,
  })
  composedItems.push(record)
  return { success: true, data: summaryOf(record), message: '' }
}

export const updateComposedItem = async ({
  quotationId,
  itemId,
  name,
  description,
  quantity,
  width,
  height,
}: {
  quotationId: string
  itemId: string
  name: string
  description: string
  quantity: number
  width: number
  height: number
}) => {
  const index = composedItems.findIndex(
    (item) => item.quotationId === quotationId && item.id === itemId,
  )
  if (index < 0) {
    return { success: false, data: null, message: 'Item não encontrado' }
  }
  if (!name.trim()) {
    return { success: false, data: null, message: 'Informe o nome do item' }
  }
  const current = composedItems[index]
  // O retrato é refeito: a venda ainda não aconteceu (AB-4 vale depois)
  const record = await buildRecord({
    id: current.id,
    quotationId,
    draftId: current.draftId,
    name: name.trim(),
    description: description.trim(),
    quantity: Math.max(1, quantity),
    width,
    height,
  })
  composedItems[index] = record
  return { success: true, data: summaryOf(record), message: '' }
}

export const removeComposedItem = async ({
  quotationId,
  itemId,
}: {
  quotationId: string
  itemId: string
}) => {
  const index = composedItems.findIndex(
    (item) => item.quotationId === quotationId && item.id === itemId,
  )
  if (index >= 0) composedItems.splice(index, 1)
  return { success: true, data: null, message: '' }
}

// O que a tela do orçamento vê: o resumo, sem custo (ORC-7)
export const getComposedItems = async ({
  quotationId,
}: {
  quotationId: string
}) => ({
  success: true,
  data: composedItems
    .filter((item) => item.quotationId === quotationId)
    .map(summaryOf),
  message: '',
})
