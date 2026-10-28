'use server'

// Acompanhamento comercial, CRM fase 2 (27/10/2026): as rotas de registrar
// contato, linha do tempo, totais e configuração. Depende do patch 11 do
// backend (crm-fase-2).

import { getItem, createItemNew, putItemNew } from '@/actions/_cruds'
import type {
  ClientTimeline,
  FollowUpSettings,
  FollowUpSummary,
  QuotationTimeline,
  RegisterContactBody,
} from '@/types/sales/followUp'

type ApiResult = {
  success: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
  message?: string
}

const ok = <T>(data: T) => ({ success: true as const, data, message: '' })
const fail = <T>(message: string | undefined, data: T) => ({
  success: false as const,
  data,
  message: message || '',
})

export const registerContact = async (
  quotationId: string,
  body: RegisterContactBody,
) => {
  const res: ApiResult = await createItemNew({
    route: `/sale/quotation/${quotationId}/contact`,
    data: body,
  })
  return res.success ? ok(res.data) : fail(res.message, null)
}

export const getQuotationTimeline = async (quotationId: string) => {
  const res: ApiResult = await getItem({
    route: `/sale/quotation/${quotationId}/contacts`,
  })
  if (!res.success) return fail(res.message, null as QuotationTimeline | null)
  return ok<QuotationTimeline>(res.data)
}

export const getClientTimeline = async (clientId: string) => {
  const res: ApiResult = await getItem({
    route: `/sale/follow-up/client/${clientId}`,
  })
  if (!res.success) return fail(res.message, null as ClientTimeline | null)
  return ok<ClientTimeline>(res.data)
}

export const getFollowUpSummary = async () => {
  const res: ApiResult = await getItem({ route: '/sale/follow-up/summary' })
  if (!res.success) return fail(res.message, null as FollowUpSummary | null)
  return ok<FollowUpSummary>(res.data)
}

export const getFollowUpSettings = async () => {
  const res: ApiResult = await getItem({ route: '/sale/follow-up/settings' })
  if (!res.success) return fail(res.message, null as FollowUpSettings | null)
  return ok<FollowUpSettings>(res.data)
}

export const updateFollowUpSettings = async (values: FollowUpSettings) => {
  const res: ApiResult = await putItemNew({
    route: '/sale/follow-up/settings',
    data: values,
  })
  if (!res.success) return fail(res.message, null as FollowUpSettings | null)
  return ok<FollowUpSettings>(res.data)
}
