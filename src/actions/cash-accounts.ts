'use server'

// Contas bancárias e caixa do dia (CX-0 a CX-5, Fase 7.1/7.2) pela API:
// /bank/account (tipo, padrão por forma, saldo inicial, saldo calculado,
// excluir × inativar) e /financial/cash-control (abrir, ajuste, fechar com a
// contagem, reabrir, aprovar, transferência em par). Valores em centavos,
// como a API nova; quem abriu, fechou e aprovou é o usuário da sessão.

// Types
import type {
  CashDay,
  BankAccount,
  MethodRule,
  AccountKind,
  SettleMode,
} from '@/app/(app-sidebar)/financeiro/controle-de-caixa/types'

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = any

const ok = <T>(data: T) => ({ success: true, data, message: '' })
const fail = <T>(message: string | undefined, data: T) => ({
  success: false,
  data,
  message: message || 'Não foi possível concluir.',
})

// O logo do banco quando o cadastro não tem ícone
const iconByCode: Record<string, string> = {
  '000': 'company',
  '001': 'bancoDoBrasil',
  '033': 'bancoSantanderBrasil',
  '104': 'caixaEconomicaFederal',
  '237': 'bancoBradesco',
  '341': 'bancoItau',
}

const toRule = (row: Raw): MethodRule => ({
  ruleId: row.id ?? undefined,
  methodId: row.paymentConditionId ?? row.paymentCondition?.id,
  methodName: row.paymentCondition?.name ?? '',
  acceptIncomes: !!row.acceptIncomes,
  incomeType: (row.incomeType ?? 'PAYSOFF') as SettleMode,
  acceptPayments: !!row.acceptPayments,
  paymentType: (row.paymentType ?? 'PAYSOFF') as SettleMode,
  isDefault: !!row.isDefault,
})

const toAccount = (row: Raw): BankAccount => ({
  id: row.id,
  name: row.name,
  kind: (row.kind ?? 'BANK') as AccountKind,
  bankName: row.bank?.name ?? '',
  bankCode: row.bank?.code ?? '',
  bankIcon: row.bank?.icon || iconByCode[row.bank?.code] || '',
  cashControl: !!row.cashControl,
  blindCount: !!row.blindCount,
  shortageTolerance: row.shortageTolerance ?? null,
  isActive: row.isActive ?? true,
  hasHistory: !!row.hasHistory,
  openingBalance: row.openingBalance ?? 0,
  openingDate: row.openingDate ?? '',
  balance: row.balance ?? 0,
  rules: (row.bankAccountCashControl ?? []).map(toRule),
})

/* ---------------------------------------------------------------------------
 * Contas
 * ------------------------------------------------------------------------- */

/** Ativas e inativas: a tela separa as duas. */
export const getBankAccounts = async () => {
  const res: ApiResult = await getItem({
    route: '/bank/account',
    params: { isActive: 'all', page: '1', limit: '100' },
  })
  if (!res.success) return fail(res.message, [] as BankAccount[])
  return ok<BankAccount[]>((res.data?.data ?? []).map(toAccount))
}

/** As formas da tabela de regras são as condições de pagamento reais. */
export const getPaymentMethods = async () => {
  const res: ApiResult = await getItem({
    route: '/payment-condition',
    params: { page: '1', limit: '100', isActive: 'true' },
  })
  if (!res.success)
    return fail(res.message, [] as { id: string; name: string }[])
  const rows: Raw[] = res.data?.data ?? res.data ?? []
  return ok(
    rows.map((row) => ({ id: row.id as string, name: row.name as string })),
  )
}

/** O id do banco pelo código que o diálogo escolhe. */
const bankIdOf = async (code: string) => {
  const res: ApiResult = await getItem({ route: '/bank' })
  const banks: Raw[] = res.data?.data ?? res.data ?? []
  return banks.find((bank) => bank.code === code)?.id as string | undefined
}

export const saveBankAccount = async (
  input: Omit<
    BankAccount,
    'id' | 'balance' | 'hasHistory' | 'isActive' | 'bankIcon'
  > & {
    id?: string
  },
) => {
  // A gaveta é sempre do "banco" da empresa (código 000)
  const bankId = await bankIdOf(input.kind === 'CASH' ? '000' : input.bankCode)
  if (!bankId) return fail('Escolha o banco da conta', null)
  const data = {
    name: input.name,
    bankId,
    kind: input.kind,
    cashControl: input.cashControl,
    blindCount: input.blindCount,
    shortageTolerance: input.shortageTolerance,
    openingBalance: input.openingBalance,
    ...(input.openingDate ? { openingDate: input.openingDate } : {}),
    bankAccountCashControl: input.rules.map((rule) => ({
      ...(rule.ruleId ? { id: rule.ruleId } : {}),
      paymentConditionId: rule.methodId,
      acceptIncomes: rule.acceptIncomes,
      incomeType: rule.incomeType,
      acceptPayments: rule.acceptPayments,
      paymentType: rule.paymentType,
      isDefault: rule.isDefault,
    })),
  }
  const res: ApiResult = input.id
    ? await updateItemNew({ route: `/bank/account/${input.id}`, data })
    : await createItemNew({ route: '/bank/account', data })
  return res.success ? ok(null) : fail(res.message, null)
}

// "Excluir" é um botão só; o servidor decide (CX-2)
export const removeBankAccount = async (id: string) => {
  const res: ApiResult = await deleteItemNew({ route: `/bank/account/${id}` })
  if (!res.success) return fail(res.message, null)
  return ok<{ removed: 'DELETED' | 'INACTIVATED' }>(res.data)
}

export const reactivateBankAccount = async (id: string) => {
  const res: ApiResult = await updateItemNew({
    route: `/bank/account/${id}/toggle-status`,
    data: { active: true },
  })
  return res.success ? ok(null) : fail(res.message, null)
}

/* ---------------------------------------------------------------------------
 * Caixa do dia
 * ------------------------------------------------------------------------- */

export const getCashControl = async () => {
  const [accountsRes, cashRes] = await Promise.all([
    getBankAccounts(),
    getItem({
      route: '/financial/cash-control',
      params: { page: '1', limit: '100' },
    }) as Promise<ApiResult>,
  ])
  const empty = {
    accounts: [] as BankAccount[],
    days: [] as CashDay[],
    today: '',
  }
  if (!cashRes.success) return fail(cashRes.message, empty)
  return ok({
    accounts: accountsRes.data.filter((account) => account.isActive),
    days: (cashRes.data?.days ?? []) as CashDay[],
    today: (cashRes.data?.today ?? '') as string,
  })
}

export const openCashDay = async (accountId: string, date: string) => {
  const res: ApiResult = await createItemNew({
    route: '/financial/cash-control',
    data: { bankAccountId: accountId, date },
  })
  return res.success ? ok(null) : fail(res.message, null)
}

export const addAdjustment = async (
  dayId: string,
  amount: number,
  reason: string,
  natureId: string,
  categoryId: string,
) => {
  const res: ApiResult = await createItemNew({
    route: `/financial/cash-control/${dayId}/adjustment`,
    data: { amount, reason, natureId, categoryId },
  })
  return res.success ? ok(null) : fail(res.message, null)
}

// Transferência é um par (CX-2): sai de uma, entra na outra, ligadas
export const transferBetweenAccounts = async (values: {
  fromId: string
  toId: string
  method: string
  amount: number
  date: string
}) => {
  const res: ApiResult = await createItemNew({
    route: '/financial/cash-control/transfer',
    data: values,
  })
  return res.success ? ok(null) : fail(res.message, null)
}

// Fechamento de acordo com o tipo da conta (CX-3)
export const closeCashDay = async (
  dayId: string,
  informed: number,
  note: string,
) => {
  const res: ApiResult = await createItemNew({
    route: `/financial/cash-control/${dayId}/close`,
    data: { informed, ...(note.trim() ? { note } : {}) },
  })
  if (!res.success) return fail(res.message, null)
  return ok<{ difference: number }>({ difference: res.data?.difference ?? 0 })
}

// Reabrir exige justificativa e anula a conferência daquele dia (ALT-7)
export const reopenCashDay = async (dayId: string, reason: string) => {
  const res: ApiResult = await createItemNew({
    route: `/financial/cash-control/${dayId}/reopen`,
    data: { reason },
  })
  return res.success ? ok(null) : fail(res.message, null)
}

// O caixa principal aprova o que recebe da frente de caixa (4.2)
export const approveMovement = async (dayId: string, movementId: string) => {
  const res: ApiResult = await createItemNew({
    route: `/financial/cash-control/${dayId}/movement/${movementId}/approve`,
  })
  return res.success ? ok(null) : fail(res.message, null)
}
