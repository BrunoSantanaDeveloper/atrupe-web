'use server'

// PROVISÓRIO: a API ainda não tem os endpoints de estoque (recurso do FULL).
// Dados de exemplo em memória.

// Types
import type {
  Invoice,
  StockItem,
  StockMovement,
} from '@/app/(app-sidebar)/estoque/types'

// Flag de demonstração: sem ela, as actions não leem nem gravam o exemplo
import { DEMO_DATA, demoOff } from '@/lib/demo'

const items: StockItem[] = [
  {
    id: 'st1',
    materialId: 'lona-440',
    name: 'Lona 440',
    variation: 'Marca X · Branca',
    unit: 'm²',
    quantity: 120,
    minimum: 50,
    averageCost: 1250,
    lastEntryCost: 1310,
    lastEntryDate: '2026-09-10',
  },
  {
    id: 'st2',
    materialId: 'ilhos',
    name: 'Ilhós',
    variation: null,
    unit: 'un',
    quantity: 320,
    minimum: 500,
    averageCost: 12,
    lastEntryCost: 14,
    lastEntryDate: '2026-08-28',
  },
  {
    id: 'st3',
    materialId: 'mdf-15',
    name: 'MDF 15 mm',
    variation: null,
    unit: 'un',
    quantity: 0,
    minimum: 4,
    averageCost: 11200,
    lastEntryCost: null,
    lastEntryDate: null,
  },
  {
    id: 'st4',
    materialId: 'tinta-sublimatica',
    name: 'Tinta sublimática',
    variation: null,
    unit: 'l',
    quantity: 8,
    minimum: 4,
    averageCost: 28000,
    lastEntryCost: 29500,
    lastEntryDate: '2026-09-02',
  },
]

const movements: StockMovement[] = [
  {
    id: 'mv1',
    date: '2026-09-10',
    kind: 'ENTRY',
    name: 'Lona 440 · Marca X · Branca',
    quantity: 100,
    unit: 'm²',
    origin: 'NF 12.345 — Distribuidora Sul',
  },
  {
    id: 'mv2',
    date: '2026-09-11',
    kind: 'CONSUMPTION',
    name: 'Lona 440 · Marca X · Branca',
    quantity: -12,
    unit: 'm²',
    origin: 'OS #1042 — Impressão em lona',
  },
  {
    id: 'mv3',
    date: '2026-09-11',
    kind: 'CONSUMPTION',
    name: 'Ilhós',
    quantity: -24,
    unit: 'un',
    origin: 'OS #1042 — Acabamento de banner',
  },
  {
    id: 'mv4',
    date: '2026-09-12',
    kind: 'ADJUSTMENT',
    name: 'Tinta sublimática',
    quantity: -1,
    unit: 'l',
    origin: 'Ajuste de inventário',
  },
]

const invoices: Invoice[] = [
  {
    id: 'nf1',
    number: '12.987',
    supplier: 'Distribuidora Sul',
    issueDate: '2026-09-20',
    total: 186000,
    status: 'PENDING',
    items: [
      {
        id: 'it1',
        supplierCode: 'LN440-BR',
        description: 'LONA BRILHO 440G 1,52M BRANCA',
        supplierUnit: 'ROLO',
        quantity: 2,
        unitValue: 68000,
        gtin: '7891234567890',
        materialId: 'lona-440',
        materialName: 'Lona 440 · Marca X · Branca',
        conversionFactor: 76,
      },
      {
        id: 'it2',
        supplierCode: 'ILH-10',
        description: 'ILHOS 10MM LATAO PACOTE 500UN',
        supplierUnit: 'PCT',
        quantity: 1,
        unitValue: 50000,
        gtin: null,
        materialId: null,
        materialName: null,
        conversionFactor: null,
      },
    ],
  },
]

export const getStockItems = async ({
  filters,
}: {
  filters?: { [key: string]: string | undefined }
}) => {
  if (!DEMO_DATA) return { success: true, data: [], message: '' }
  const search = filters?.search?.trim().toLowerCase()
  const status = filters?.status

  const data = items
    .filter((item) => {
      if (status === 'abaixo-do-minimo') return item.quantity < item.minimum
      if (status === 'zerados') return item.quantity === 0

      return true
    })
    .filter((item) => !search || item.name.toLowerCase().includes(search))

  return { success: true, data, message: '' }
}

export const getStockMovements = async () => {
  if (!DEMO_DATA) return { success: true, data: [], message: '' }
  return {
    success: true,
    data: movements,
    message: '',
  }
}

export const getInvoices = async () => {
  if (!DEMO_DATA) return { success: true, data: [], message: '' }
  return {
    success: true,
    data: invoices,
    message: '',
  }
}

// Conciliação: o item do fornecedor é ligado ao material interno, com o fator
// de conversão da unidade de compra para a unidade de venda (§13 e DC-9)
export const matchInvoiceItem = async ({
  invoiceId,
  itemId,
  materialId,
  materialName,
  conversionFactor,
}: {
  invoiceId: string
  itemId: string
  materialId: string
  materialName: string
  conversionFactor: number
}) => {
  if (!DEMO_DATA) return demoOff()
  const invoice = invoices.find((item) => item.id === invoiceId)
  const item = invoice?.items.find((current) => current.id === itemId)

  if (!invoice || !item) {
    return { success: false, data: null, message: 'Item não encontrado' }
  }

  item.materialId = materialId
  item.materialName = materialName
  item.conversionFactor = conversionFactor

  invoice.status = invoice.items.every((current) => current.materialId)
    ? 'MATCHED'
    : 'PENDING'

  return { success: true, data: item, message: '' }
}

// Confirmar a entrada soma a quantidade convertida e atualiza o custo do
// material (D3 §7.4: preço variável recalcula; fixo muda a margem)
export const confirmInvoiceEntry = async ({
  invoiceId,
}: {
  invoiceId: string
}) => {
  if (!DEMO_DATA) return demoOff()
  const invoice = invoices.find((item) => item.id === invoiceId)

  if (!invoice) {
    return { success: false, data: null, message: 'Nota não encontrada' }
  }

  const pending = invoice.items.filter((item) => !item.materialId)

  if (pending.length) {
    return {
      success: false,
      data: null,
      message: `${pending.length} item(ns) da nota ainda não foram vinculados a um material.`,
    }
  }

  invoice.items.forEach((item) => {
    const stock = items.find(
      (current) => current.materialId === item.materialId,
    )
    const quantity = item.quantity * (item.conversionFactor || 1)

    if (stock) {
      stock.quantity += quantity
      stock.lastEntryCost = Math.round(
        (item.unitValue * item.quantity) / quantity,
      )
      stock.lastEntryDate = invoice.issueDate
    }

    movements.unshift({
      id: `mv-${Date.now()}-${item.id}`,
      date: invoice.issueDate,
      kind: 'ENTRY',
      name: item.materialName || item.description,
      quantity,
      unit: stock?.unit || item.supplierUnit,
      origin: `NF ${invoice.number} — ${invoice.supplier}`,
    })
  })

  invoice.status = 'MATCHED'

  return { success: true, data: null, message: '' }
}
