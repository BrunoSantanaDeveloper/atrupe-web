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
} from '@/app/(app-sidebar)/vendas/orcamentos/[quotationId]/composicao/types'

const newId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

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
