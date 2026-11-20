'use server'

// A frente de caixa (FC-1 a FC-20, Fase 7.4) e a venda rápida vista pelo
// vendedor (VR-5, Fase 7.3) pela API: /financial/pdv e as rotas da venda
// rápida no orçamento. Valores em centavos; quem abre, recebe, estorna e
// fecha é o usuário da sessão.

// Types
import type {
  CashFront,
  CashFrontValues,
  CashSession,
  PaymentPart,
  PendingSale,
  QuickSaleCheckout,
} from '@/app/(app-sidebar)/financeiro/frente-de-caixa/types'

// Actions
import {
  getItem,
  createItemNew,
  deleteItemNew,
  updateItemNew,
} from '@/actions/_cruds'

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
    forgotten: [] as CashSession[],
    workdayEnd: '18:00',
  }
  if (!res.success) return fail(res.message, empty)
  return ok({
    session: (res.data?.session ?? null) as CashSession | null,
    sales: (res.data?.sales ?? []) as PendingSale[],
    openCashFronts: (res.data?.openCashFronts ?? 0) as number,
    // Os caixas de outros operadores esquecidos abertos (FC-14)
    forgotten: (res.data?.forgotten ?? []) as CashSession[],
    // O fim do expediente, para o aviso antes do bloqueio (FC-14)
    workdayEnd: (res.data?.workdayEnd ?? '18:00') as string,
  })
}

// A sessão aberta do operador: as rotas da sessão vão pelo id dela
const openSessionId = async () => {
  const res = await getCashFront()
  const session = res.data.session
  return session?.status === 'OPEN' ? session.id : null
}

// `cashFrontId`: a frente escolhida por quem tem mais de uma liberada
// (Lista Lite 19/11, item 2); sem ela, a API pega a primeira livre
export const openCashSession = async (
  openingBalance: number,
  cashFrontId?: string,
) => {
  const res: ApiResult = await createItemNew({
    route: '/financial/pdv/session',
    data: { openingBalance, ...(cashFrontId ? { cashFrontId } : {}) },
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
  // O troco dado, para o comprovante (FC-16)
  change = 0,
) => {
  const res: ApiResult = await createItemNew({
    route: `/financial/pdv/sale/${saleId}/receive`,
    data: {
      parts: parts.map(partBody),
      deliver,
      discount,
      waiveDownPayment,
      change,
    },
  })
  if (!res.success) return fail(res.message, null)
  return ok<PendingSale>(res.data)
}

// Rejeitar a venda da fila que não recebeu nada (FC-13.1): o cliente
// desistiu no balcão. O motivo é o do cadastro de rejeição, quando o plano
// o tem; sem estorno
export const rejectSale = async (saleId: string, reasonId?: string) => {
  const res: ApiResult = await createItemNew({
    route: `/financial/pdv/sale/${saleId}/reject`,
    data: reasonId ? { reasonId } : {},
  })
  return res.success ? ok(res.data) : fail(res.message, null)
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
  // O caixa esquecido de outro operador (FC-14); sem ele, o do operador
  sessionId?: string,
) => {
  const id = sessionId || (await openSessionId())
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

// Devolver a venda à fila (FC-5): quem puxou e ainda não recebeu nada
export const releaseSale = async (saleId: string) => {
  const res: ApiResult = await deleteItemNew({
    route: `/financial/pdv/sale/${saleId}/claim`,
  })
  if (!res.success) return fail(res.message, null)
  return ok<PendingSale>(res.data)
}

// O cadastro das frentes de caixa (FC-15)
export const getCashFronts = async () => {
  const res: ApiResult = await getItem({ route: '/financial/pdv/front' })
  if (!res.success) return fail(res.message, [] as CashFront[])
  return ok<CashFront[]>(res.data ?? [])
}

export const saveCashFront = async (
  id: string | undefined,
  values: CashFrontValues,
) => {
  const res: ApiResult = id
    ? await updateItemNew({ route: `/financial/pdv/front/${id}`, data: values })
    : await createItemNew({ route: '/financial/pdv/front', data: values })
  if (!res.success) return fail(res.message, null)
  return ok<CashFront>(res.data)
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
  // O troco dado, para o comprovante (FC-16)
  change = 0,
) => {
  const res: ApiResult = await createItemNew({
    route: `/sale/quotation/${origin.quotationId}/quick-sale/charge`,
    data: { parts: parts.map(partBody), discount, change },
  })
  if (!res.success) return fail(res.message, null)
  return ok<QuickSaleCheckout>(res.data)
}

/* ---------------------------------------------------------------------------
 * NFC-e na frente de caixa (pedido do Maicol, 20/11/2026): sempre à mão,
 * pelo CNPJ cadastrado, com o CPF opcional
 * ------------------------------------------------------------------------- */

export type PdvNfceStatus = { enabled: boolean; reason: string | null }

export const getPdvNfceStatus = async () => {
  const res: ApiResult = await getItem({ route: '/financial/pdv/nfce' })
  if (!res.success)
    return fail(res.message, { enabled: false, reason: res.message })
  return ok<PdvNfceStatus>(res.data)
}

export const emitSaleNfce = async (saleId: string, cpf?: string) => {
  const res: ApiResult = await createItemNew({
    route: `/financial/pdv/sale/${saleId}/nfce`,
    data: cpf ? { cpf } : {},
  })
  if (!res.success) return fail(res.message, null)
  return ok<{ id: string; status: string; numero: number | null }>(res.data)
}
