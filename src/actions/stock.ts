'use server'

// Estoque e entrada de nota (ES-1 a ES-6, FULL, Fase 7.5) pela API: /stock,
// /stock/movement e /stock/invoice-entry. Valores em centavos; quantidades
// na unidade do material. A nota entra pelo XML da NF-e.

// Types
import type {
  Invoice,
  StockItem,
  StockMovement,
} from '@/app/(app-sidebar)/estoque/types'

// Actions
import { getItem, createItemNew, updateItemNew } from '@/actions/_cruds'

type ApiResult = {
  success: boolean
  // O corpo de cada rota é tipado onde é lido
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
  message?: string
}

// A aba "Todos" da tela é o saldo sem filtro
const clean = (filters?: { [key: string]: string | undefined }) =>
  Object.fromEntries(
    Object.entries(filters ?? {}).filter(
      ([key, value]) =>
        !!value &&
        ['status', 'search', 'page', 'limit'].includes(key) &&
        !(key === 'status' && value === 'todos'),
    ),
  ) as { [key: string]: string }

export const getStockItems = async ({
  filters,
}: {
  filters?: { [key: string]: string | undefined }
}) => {
  const res: ApiResult = await getItem({
    route: '/stock',
    params: { limit: '100', ...clean(filters) },
  })
  if (!res.success)
    return { success: false, data: [] as StockItem[], message: res.message }
  return {
    success: true,
    data: (res.data?.data ?? []) as StockItem[],
    message: '',
  }
}

export const getStockMovements = async () => {
  const res: ApiResult = await getItem({
    route: '/stock/movement',
    params: { limit: '100' },
  })
  if (!res.success)
    return { success: false, data: [] as StockMovement[], message: res.message }
  return {
    success: true,
    data: (res.data?.data ?? []) as StockMovement[],
    message: '',
  }
}

// As notas que aguardam entrada (pendentes e prontas)
export const getInvoices = async () => {
  const res: ApiResult = await getItem({
    route: '/stock/invoice-entry',
    params: { limit: '50' },
  })
  if (!res.success)
    return { success: false, data: [] as Invoice[], message: res.message }
  return {
    success: true,
    data: (res.data?.data ?? []) as Invoice[],
    message: '',
  }
}

// O XML da NF-e que o fornecedor mandou: os itens chegam como estão na nota,
// e o de-para já reconhece o que foi vinculado antes
export const importInvoiceXml = async (formData: FormData) => {
  const res: ApiResult = await createItemNew({
    route: '/stock/invoice-entry',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  if (!res.success)
    return { success: false, data: null, message: res.message || '' }
  return { success: true, data: res.data as Invoice, message: '' }
}

// Conciliação: o item do fornecedor é ligado ao material interno, com o fator
// de conversão da unidade de compra para a do material (ES-3). O nome do
// material vem do cadastro
export const matchInvoiceItem = async ({
  invoiceId,
  itemId,
  materialId,
  variationId,
  conversionFactor,
}: {
  invoiceId: string
  itemId: string
  materialId: string
  variationId?: string | null
  conversionFactor: number
}) => {
  const res: ApiResult = await updateItemNew({
    route: `/stock/invoice-entry/${invoiceId}/item/${itemId}`,
    data: {
      materialId,
      ...(variationId ? { variationId } : {}),
      conversionFactor,
    },
  })
  if (!res.success)
    return { success: false, data: null, message: res.message || '' }
  return { success: true, data: res.data, message: '' }
}

// Confirmar a entrada soma a quantidade convertida e atualiza o custo médio,
// que passa a ser o custo do material (ES-4, ES-5)
export const confirmInvoiceEntry = async ({
  invoiceId,
}: {
  invoiceId: string
}) => {
  const res: ApiResult = await createItemNew({
    route: `/stock/invoice-entry/${invoiceId}/confirm`,
  })
  if (!res.success)
    return { success: false, data: null, message: res.message || '' }
  return { success: true, data: res.data, message: '' }
}

// O mínimo do material: abaixo dele, a aba "Abaixo do mínimo" avisa
export const setStockMinimum = async (id: string, minimum: number) => {
  const res: ApiResult = await updateItemNew({
    route: `/stock/${id}/minimum`,
    data: { minimum },
  })
  if (!res.success)
    return { success: false, data: null, message: res.message || '' }
  return { success: true, data: res.data, message: '' }
}

// O ajuste de inventário pela contagem física, com motivo
export const adjustStock = async (
  id: string,
  counted: number,
  reason: string,
) => {
  const res: ApiResult = await createItemNew({
    route: `/stock/${id}/adjustment`,
    data: { counted, reason },
  })
  if (!res.success)
    return { success: false, data: null, message: res.message || '' }
  return { success: true, data: res.data, message: '' }
}
