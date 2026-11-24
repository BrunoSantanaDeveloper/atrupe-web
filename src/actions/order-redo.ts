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
  // EXECUTING: a refação está sendo feita agora; FAILED: parou no meio e
  // `failReason` diz por quê (a cópia, se nasceu, fica em newQuotationId)
  status: 'PENDING_APPROVAL' | 'EXECUTING' | 'EXECUTED' | 'REJECTED' | 'FAILED'
  failReason?: string | null
  needsApproval: boolean
  produced: { tasks: number; stages: number; stockMovements: number } | null
  requestedById: string
  requestedByName: string
  responsibleName: string | null
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

// O aviso do pedido pela situação que a API devolve: sem produção nem
// material baixado, a O.S. é refeita na hora; com eles, outra pessoa aprova.
// Um objeto de mensagens, para a extração de textos achar cada uma (IN-7)
const REQUESTED = {
  executed: { message: 'O.S. refeita: a nova está em digitação' },
  pending: { message: 'Pedido registrado: outra pessoa aprova a refação' },
}

export const requestOrderRedo = async (
  orderId: string,
  values: {
    reason: string
    excess: 'CLIENT' | 'COMPANY'
    responsibleKind?: 'PERSON' | 'SECTOR'
    responsibleId?: string
    /** O motivo do cancelamento da O.S. atual, dos cadastrados na empresa */
    reasonId?: string
  },
) => {
  const res = await createItemNew({
    route: `/sale/order-redo/order/${orderId}`,
    data: values,
  })
  const status = (res.data as OrderRedo | undefined)?.status
  return result<OrderRedo>(
    res,
    status === 'EXECUTED'
      ? REQUESTED.executed.message
      : REQUESTED.pending.message,
  )
}

export const approveOrderRedo = async (id: string) =>
  result<OrderRedo>(
    await createItemNew({ route: `/sale/order-redo/${id}/approve` }),
    REQUESTED.executed.message,
  )

export const rejectOrderRedo = async (id: string, reason: string) =>
  result<OrderRedo>(
    await createItemNew({
      route: `/sale/order-redo/${id}/reject`,
      data: { reason },
    }),
    'Pedido recusado',
  )
