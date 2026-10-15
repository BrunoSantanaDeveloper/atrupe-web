'use server'

// A frente de caixa (FC-1 a FC-20, Fase 7.4) e a venda rápida vista pelo
// vendedor (VR-5, Fase 7.3) pela API: /financial/pdv e as rotas da venda
// rápida no orçamento. Valores em centavos; quem abre, recebe, estorna e
// fecha é o usuário da sessão.

// Types
import type {
  CashSession,
  PaymentPart,
  PendingSale,
  QuickSaleCheckout,
} from '@/app/(app-sidebar)/financeiro/frente-de-caixa/types'

// Actions
import { getItem, createItemNew } from '@/actions/_cruds'

type ApiResult = {
  success: boolean
  // O corpo de cada rota é tipado onde é lido
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
  message?: string
}

const ok = <T>(data: T) => ({ success: true, data, message: '' })
const fail = <T>(message: string | undefined, data: T) => ({
  success: false,
  data,
  message: message || 'Não foi possível concluir.',
})

// A parte vai com a forma do cadastro e a conta escolhida (FC-9)
const partBody = (part: PaymentPart) => ({
  method: part.method,
  paymentConditionId: part.paymentConditionId,
  bankAccountId: part.method === 'CASH' ? null : part.bankAccountId || null,
  amount: part.amount,
})

export const getCashFront = async () => {
  const res: ApiResult = await getItem({ route: '/financial/pdv' })
  const empty = {
    session: null as CashSession | null,
    sales: [] as PendingSale[],
    openCashFronts: 0,
  }
  if (!res.success) return fail(res.message, empty)
  return ok({
    session: (res.data?.session ?? null) as CashSession | null,
    sales: (res.data?.sales ?? []) as PendingSale[],
    openCashFronts: (res.data?.openCashFronts ?? 0) as number,
  })
}

// A sessão aberta do operador: as rotas da sessão vão pelo id dela
const openSessionId = async () => {
  const res = await getCashFront()
  const session = res.data.session
  return session?.status === 'OPEN' ? session.id : null
}

export const openCashSession = async (openingBalance: number) => {
  const res: ApiResult = await createItemNew({
    route: '/financial/pdv/session',
    data: { openingBalance },
  })
  if (!res.success) return fail(res.message, null)
  return ok<CashSession>(res.data)
}

// Sangria e suprimento (FC-8): dinheiro mudando de lugar, com motivo, de ou
// para uma conta da empresa (sem ela, a conta da gaveta)
export const addCashMovement = async (
  kind: 'WITHDRAWAL' | 'SUPPLY',
  amount: number,
  reason: string,
  bankAccountId?: string,
) => {
  const id = await openSessionId()
  if (!id) return fail('Nenhum caixa aberto', null)
  const res: ApiResult = await createItemNew({
    route: `/financial/pdv/session/${id}/movement`,
    data: { kind, amount, reason, ...(bankAccountId ? { bankAccountId } : {}) },
  })
  if (!res.success) return fail(res.message, null)
  return ok<CashSession>(res.data)
}

// Receber a venda (FC-2, FC-9, FC-17, FC-18): misto, com o troco já tirado
// do dinheiro, o arredondamento como desconto e a entrega à parte
export const receiveSale = async (
  saleId: string,
  parts: PaymentPart[],
  deliver: boolean,
  discount = 0,
  waiveDownPayment = false,
) => {
  const res: ApiResult = await createItemNew({
    route: `/financial/pdv/sale/${saleId}/receive`,
    data: {
      parts: parts.map(partBody),
      deliver,
      discount,
      waiveDownPayment,
    },
  })
  if (!res.success) return fail(res.message, null)
  return ok<PendingSale>(res.data)
}

// O estorno é o cancelamento da venda, com justificativa (FC-13)
export const reverseSale = async (saleId: string, reason: string) => {
  const res: ApiResult = await createItemNew({
    route: `/financial/pdv/sale/${saleId}/reverse`,
    data: { reason },
  })
  return res.success ? ok(res.data) : fail(res.message, null)
}

type CloseResult = {
  note?: string
  countedCash: number
  expected: number
  difference: number
  posted: boolean
  keep: number
  transfers: {
    method: PaymentPart['method']
    amount: number
    destination: string
    pending?: boolean
  }[]
  billed: {
    reference: string
    client: string
    total: number
    billing: string
  }[]
}

// Fechamento (FC-7, 4.2): a quebra no nome do operador fora da tolerância e
// um movimento por forma nas contas, o dinheiro aguardando aprovação
export const closeCashSession = async (
  countedCash: number,
  keep = 0,
  note = '',
) => {
  const id = await openSessionId()
  if (!id) return fail('Nenhum caixa aberto', null)
  const res: ApiResult = await createItemNew({
    route: `/financial/pdv/session/${id}/close`,
    data: { countedCash, keep, ...(note.trim() ? { note } : {}) },
  })
  if (!res.success) return fail(res.message, null)
  return ok<CloseResult>(res.data)
}

// Trabalho pronto, cliente não buscou (FC-19)
export const markSaleReady = async (saleId: string) => {
  const res: ApiResult = await createItemNew({
    route: `/financial/pdv/sale/${saleId}/ready`,
  })
  if (!res.success) return fail(res.message, null)
  return ok<PendingSale>(res.data)
}

// Dar baixa no trabalho não retirado (FC-19): a perda é o que não foi pago
export const discardPickup = async (saleId: string, reason: string) => {
  const res: ApiResult = await createItemNew({
    route: `/financial/pdv/sale/${saleId}/discard`,
    data: { reason },
  })
  if (!res.success) return fail(res.message, null)
  return ok<{ loss: number; discardedBy: string; discardedAt: string }>(
    res.data,
  )
}

// Com mais de um caixa, cada um puxa para si a venda que vai atender (FC-5)
export const claimSale = async (saleId: string) => {
  const res: ApiResult = await createItemNew({
    route: `/financial/pdv/sale/${saleId}/claim`,
  })
  if (!res.success) return fail(res.message, null)
  return ok<PendingSale>(res.data)
}

// Reverter a venda rápida para faturamento (FC-4): no nome do cliente, com a
// forma e as parcelas dele, no fluxo financeiro
export const reverseToBilling = async (
  saleId: string,
  values: {
    client: { id: string; name: string }
    paymentConditionId: string
    installmentQty: number
    dueDate: string
    notes?: string
  },
) => {
  const res: ApiResult = await createItemNew({
    route: `/financial/pdv/sale/${saleId}/bill`,
    data: {
      clientId: values.client.id,
      paymentConditionId: values.paymentConditionId,
      installmentQty: values.installmentQty,
      dueDate: values.dueDate,
      ...(values.notes?.trim() ? { notes: values.notes } : {}),
    },
  })
  if (!res.success) return fail(res.message, null)
  return ok<PendingSale>(res.data)
}

/* ---------------------------------------------------------------------------
 * A venda rápida do lado do vendedor
 * ------------------------------------------------------------------------- */

// A situação no caixa (a tela consulta a cada 15 s), ou nula
export const getQuickSaleCheckout = async (quotationId: string) => {
  const res: ApiResult = await getItem({
    route: `/sale/quotation/${quotationId}/cash-status`,
  })
  if (!res.success) return fail(res.message, null as QuickSaleCheckout | null)
  return ok<QuickSaleCheckout | null>(res.data || null)
}

type QuickSaleOrigin = { quotationId: string }

// Enviar ao caixa é aprovar (FC-12): a venda entra na fila e trava (FC-11)
export const sendQuickSaleToCash = async (origin: QuickSaleOrigin) => {
  const res: ApiResult = await createItemNew({
    route: `/sale/quotation/${origin.quotationId}/approve`,
  })
  return res.success ? ok(res.data) : fail(res.message, null)
}

// Cobrar na hora (VR-5): só à vista, pelo total; aprova e recebe junto
export const chargeQuickSaleNow = async (
  origin: QuickSaleOrigin,
  parts: PaymentPart[],
  discount = 0,
) => {
  const res: ApiResult = await createItemNew({
    route: `/sale/quotation/${origin.quotationId}/quick-sale/charge`,
    data: { parts: parts.map(partBody), discount },
  })
  if (!res.success) return fail(res.message, null)
  return ok<QuickSaleCheckout>(res.data)
}
