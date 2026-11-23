'use server'

// As compras e os lotes do FULL (ES-8 a ES-17) pela API: /stock/purchase
// (solicitação, cotação, pedido) e /stock/lot. Valores em centavos.

// Types
import type {
  TaskLots,
  LotPlan,
  OrderInvoice,
  PurchaseOrder,
  PurchaseRequest,
  StockLot,
} from '@/app/(app-sidebar)/estoque/compras/types'

// Actions
import { getItem, createItemNew, deleteItemNew } from '@/actions/_cruds'

type ApiResult = {
  success: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
  message?: string
}

const list = async <T>(route: string, params?: Record<string, string>) => {
  const res: ApiResult = await getItem({ route, params })
  return res.success
    ? { success: true, data: (res.data ?? []) as T[], message: '' }
    : { success: false, data: [] as T[], message: res.message || '' }
}

const post = async <T>(route: string, data: object, done: string) => {
  const res: ApiResult = await createItemNew({ route, data })
  return res.success
    ? { success: true, data: res.data as T, message: done }
    : { success: false, data: null, message: res.message || 'Não deu certo' }
}

/* --------------------------------------------------- solicitação */

export const getPurchaseRequests = async (filters: {
  status?: string
  mine?: boolean
  search?: string
}) =>
  list<PurchaseRequest>('/stock/purchase/request', {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.mine ? { mine: 'true' } : {}),
    ...(filters.search ? { search: filters.search } : {}),
  })

export const createPurchaseRequest = async (values: {
  materialId?: string | null
  variationId?: string | null
  description?: string
  quantity: number
  unit?: string
  neededBy?: string | null
  note?: string | null
}) =>
  post<PurchaseRequest>(
    '/stock/purchase/request',
    values,
    'Solicitação registrada',
  )

export const cancelPurchaseRequest = async (id: string, reason: string) =>
  post<PurchaseRequest>(
    `/stock/purchase/request/${id}/cancel`,
    { reason },
    'Solicitação cancelada',
  )

export const addPurchaseQuote = async (
  requestId: string,
  values: {
    supplierId?: string | null
    supplierName?: string
    quantity?: number
    unitPrice: number
    deliveryDays?: number | null
    paymentTerms?: string | null
    validUntil?: string | null
    note?: string | null
  },
) =>
  post<PurchaseRequest>(
    `/stock/purchase/request/${requestId}/quote`,
    values,
    'Cotação lançada',
  )

export const removePurchaseQuote = async (
  requestId: string,
  quoteId: string,
) => {
  const res: ApiResult = await deleteItemNew({
    route: `/stock/purchase/request/${requestId}/quote/${quoteId}`,
  })
  return res.success
    ? { success: true, message: 'Cotação retirada' }
    : { success: false, message: res.message || 'Não deu certo' }
}

export const closePurchaseOrder = async (values: {
  quoteIds: string[]
  expectedAt?: string | null
  note?: string | null
}) =>
  post<PurchaseOrder[]>(
    '/stock/purchase/order/close',
    values,
    'Pedido de compra fechado',
  )

/* -------------------------------------------------------- pedido */

export const getPurchaseOrders = async (filters: {
  status?: string
  search?: string
}) =>
  list<PurchaseOrder>('/stock/purchase/order', {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.search ? { search: filters.search } : {}),
  })

export const createPurchaseOrder = async (values: {
  supplierId?: string | null
  supplierName?: string
  expectedAt?: string | null
  note?: string | null
  items: {
    materialId?: string | null
    variationId?: string | null
    description?: string
    quantity: number
    unit?: string
    unitPrice: number
  }[]
}) =>
  post<PurchaseOrder>('/stock/purchase/order', values, 'Pedido de compra feito')

export const getOrderInvoices = async (id: string) =>
  list<OrderInvoice>(`/stock/purchase/order/${id}/invoices`)

export const deliverPurchaseOrder = async (id: string) =>
  post<PurchaseOrder>(
    `/stock/purchase/order/${id}/deliver`,
    {},
    'Entrega confirmada',
  )

export const checkPurchaseOrder = async (
  id: string,
  values: {
    items: {
      itemId: string
      receivedQuantity: number
      divergence?: string | null
    }[]
    invoiceId?: string | null
  },
) =>
  post<PurchaseOrder>(
    `/stock/purchase/order/${id}/check`,
    values,
    'Entrega conferida',
  )

export const receivePurchaseOrder = async (id: string, lots: LotPlan[]) =>
  post<PurchaseOrder>(
    `/stock/purchase/order/${id}/receive`,
    { lots },
    'Lançado no estoque',
  )

export const createOrderPayables = async (
  id: string,
  values: { installments: number; firstDue: string; everyDays?: number },
) =>
  post<PurchaseOrder>(
    `/stock/purchase/order/${id}/payables`,
    values,
    'Contas a pagar geradas',
  )

export const cancelPurchaseOrder = async (id: string, reason: string) =>
  post<PurchaseOrder>(
    `/stock/purchase/order/${id}/cancel`,
    { reason },
    'Pedido cancelado',
  )

/* ---------------------------------------------------------- lote */

export const getStockLots = async (filters: {
  view?: string
  status?: string
  sectorId?: string
  search?: string
}) =>
  list<StockLot>('/stock/lot', {
    ...(filters.view ? { view: filters.view } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.sectorId ? { sectorId: filters.sectorId } : {}),
    ...(filters.search ? { search: filters.search } : {}),
  })

export const createStockLot = async (values: {
  materialId: string
  variationId?: string | null
  measure: string
  quantity: number
  width?: number | null
  length?: number | null
  cost: number
  supplierName?: string
  brand?: string
  color?: string
  enterStock?: boolean
}) => post<StockLot>('/stock/lot', values, 'Lote lançado')

export const finishStockLot = async (id: string) =>
  post<StockLot>(`/stock/lot/${id}/finish`, {}, 'Lote finalizado')

/** Abrir o lote num setor (ES-16): sem setor, o do material. */
export const openStockLot = async (id: string, sectorId?: string | null) =>
  post<StockLot>(
    `/stock/lot/${id}/open`,
    { sectorId: sectorId || null },
    'Lote aberto',
  )

export const moveStockLot = async (id: string, sectorId: string) =>
  post<StockLot>(
    `/stock/lot/${id}/move`,
    { sectorId },
    'Lote levado para o setor',
  )

/** Os rolos abertos no setor da tarefa e as baixas dela (ES-16). */
export const getTaskLots = async (taskId: string) => {
  const res: ApiResult = await getItem({
    route: `/production/task/${taskId}/lots`,
  })
  return res.success
    ? { success: true, data: res.data as TaskLots, message: '' }
    : { success: false, data: null, message: res.message || '' }
}

export const registerTaskLotUse = async (
  taskId: string,
  values: {
    lotId: string
    length?: number
    quantity?: number
    replaces?: string | null
    note?: string
  },
) =>
  post<unknown>(
    `/production/task/${taskId}/lot-use`,
    values,
    'Baixa registrada no rolo',
  )

// A baixa conjunta (VS-2, FULL): vários trabalhos numa impressão só
export const registerBatchLotUse = async (values: {
  taskIds: string[]
  lotId: string
  length: number
  secondLotId?: string
  secondLength?: number
  note?: string
}) => {
  const res: ApiResult = await createItemNew({
    route: '/production/task/lot-use-batch',
    data: values,
  })
  return res.success
    ? {
        success: true,
        data: res.data as { message: string },
        message: (res.data?.message as string) || 'Baixa conjunta registrada',
      }
    : { success: false, data: null, message: res.message || 'Não deu certo' }
}

export const consumeStockLot = async (
  id: string,
  values: {
    length?: number
    remainingWidth?: number
    remainingLength?: number
    quantity?: number
    note?: string
  },
) => post<StockLot>(`/stock/lot/${id}/use`, values, 'Baixa registrada')

export const splitStockLot = async (
  id: string,
  values: { length?: number; width?: number; quantity?: number },
) =>
  post<{ lot: StockLot; piece: StockLot }>(
    `/stock/lot/${id}/split`,
    values,
    'Lote dividido',
  )

export const cancelStockLot = async (id: string, reason: string) =>
  post<StockLot>(`/stock/lot/${id}/cancel`, { reason }, 'Lote cancelado')

/* ------------------------------------------------- as escolhas */

export const getSupplierOptions = async () => {
  const res: ApiResult = await getItem({
    route: '/supplier',
    params: { status: 'ACTIVE', limit: '500' },
  })
  const rows = (res.data?.data ?? res.data ?? []) as {
    id: string
    name: string
  }[]
  return res.success && Array.isArray(rows)
    ? rows.map((row) => ({ id: row.id, name: row.name }))
    : []
}
