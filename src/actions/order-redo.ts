'use server'

// Refazer a O.S. (GP-51; Maicol, 23/11/2026) pela API (/sale/order-redo).
// Num arquivo "use server" só se exportam funções assíncronas.

import { getItem, createItemNew } from '@/actions/_cruds'

type ApiResult = { success: boolean; message?: string; data?: unknown }

export type OrderRedo = {
  id: string
  orderId: string
  oldQuotationId: string
  newQuotationId: string | null
  reason: string
  excess: 'CLIENT' | 'COMPANY'
  status: 'PENDING_APPROVAL' | 'EXECUTED' | 'REJECTED'
  needsApproval: boolean
  produced: { tasks: number; stages: number; stockMovements: number } | null
  requestedByName: string
  approvedByName: string | null
  rejectReason: string | null
  carried: number
  lossItems:
    | { item: string; produced: number; now: number; excess: number }[]
    | null
  createdAt: string
}

const result = <T>(res: ApiResult, done: string) =>
  res.success
    ? { success: true, data: res.data as T, message: done }
    : { success: false, data: null, message: res.message || 'Não deu certo' }

export const getOrderRedos = async (orderId: string) =>
  result<OrderRedo[]>(
    await getItem({ route: `/sale/order-redo/order/${orderId}` }),
    '',
  )

export const requestOrderRedo = async (
  orderId: string,
  values: { reason: string; excess: 'CLIENT' | 'COMPANY' },
) =>
  result<OrderRedo>(
    await createItemNew({
      route: `/sale/order-redo/order/${orderId}`,
      data: values,
    }),
    'Pedido registrado',
  )

export const approveOrderRedo = async (id: string) =>
  result<OrderRedo>(
    await createItemNew({ route: `/sale/order-redo/${id}/approve` }),
    'O.S. refeita: a nova está em digitação',
  )

export const rejectOrderRedo = async (id: string, reason: string) =>
  result<OrderRedo>(
    await createItemNew({
      route: `/sale/order-redo/${id}/reject`,
      data: { reason },
    }),
    'Pedido recusado',
  )
