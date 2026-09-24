'use server'

// PROVISÓRIO: a API ainda não tem os endpoints da composição no orçamento
// (recurso do PRO). Dados de exemplo em memória, no formato das actions reais.

// Types
import type {
  AddOption,
  Quotation,
  QuotationItem,
  QuotationLine,
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
          },
          {
            id: 'line-2',
            kind: 'PROCESS',
            name: 'Acabamento de banner',
            sector: 'Produção',
            tags: ['3 m²', 'Ilhoses: 16'],
            cost: 1308,
            price: 2198,
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
          },
          {
            id: 'line-4',
            kind: 'PART',
            name: 'Estrutura em metalon',
            sector: 'Parte do produto',
            tags: ['2 x 0,4'],
            cost: 6200,
            price: 10416,
          },
          {
            id: 'line-5',
            kind: 'LOOSE',
            name: 'Pintura eletrostática',
            sector: 'Terceirizado · Pinta Bem',
            tags: ['avulso'],
            cost: 9000,
            price: 15120,
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
    },
    {
      id: 'adesivo',
      name: 'Adesivo recortado',
      sector: 'Impressão',
      unit: 'm²',
      price: 3500,
      releasedForSale: true,
    },
    {
      id: 'cartao',
      name: 'Cartão de visita · 1000 un',
      sector: 'Gráfica Rápida',
      unit: 'un',
      price: 12000,
      releasedForSale: true,
    },
    {
      id: 'placa-pvc',
      name: 'Placa PVC 3 mm',
      sector: 'CNC',
      unit: 'un',
      price: 3900,
      releasedForSale: true,
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
}: {
  quotationId: string
  option: AddOption
  width: number
  height: number
  quantity: number
}) => {
  const quotation = find(quotationId)

  const item: QuotationItem = {
    id: newId('item'),
    name: option.name,
    origin: 'LIBRARY',
    sector: option.sector,
    quantity,
    width,
    height,
    fields: [],
    discount: 0,
    price: option.price,
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
