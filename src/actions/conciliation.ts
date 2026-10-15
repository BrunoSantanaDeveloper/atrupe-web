'use server'

// A conciliação com o extrato em OFX (CX-6, LITE) pela API
// /financial/conciliation. Valores em centavos, com sinal: positivo entrou
// na conta.

// Actions
import { getItem, createItemNew } from '@/actions/_cruds'

type ApiResult = {
  success: boolean
  // O corpo de cada rota é tipado onde é lido
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
  message?: string
}

export type StatementLineStatus =
  | 'MATCHED'
  | 'SUGGESTED'
  | 'UNMATCHED'
  | 'CREATED'
  | 'IGNORED'

export type StatementLine = {
  id: string
  date: string
  amount: number
  memo: string
  status: StatementLineStatus
  transactionId: string | null
  receivableInstallmentId: string | null
  payableInstallmentId: string | null
  matchedWith: string | null
  matchedBy: string | null
}

export type SystemEntry = {
  kind: 'transaction' | 'receivable' | 'payable'
  id: string
  day: string
  amount: number
  description: string
}

export type ConciliationView = {
  account: { id: string; name: string; kind: string }
  from: string
  to: string
  lines: StatementLine[]
  systemOnly: SystemEntry[]
}

const ok = <T>(data: T) => ({ success: true, data, message: '' })
const fail = <T>(message: string | undefined, data: T) => ({
  success: false,
  data,
  message: message || 'Não foi possível concluir.',
})

export const getConciliation = async (params: {
  bankAccountId: string
  from?: string
  to?: string
}) => {
  const res: ApiResult = await getItem({
    route: '/financial/conciliation',
    params: Object.fromEntries(
      Object.entries(params).filter(([, value]) => !!value),
    ) as Record<string, string>,
  })
  if (!res.success) return fail(res.message, null as ConciliationView | null)
  return ok<ConciliationView>(res.data)
}

// O arquivo OFX que o banco exporta: as linhas já importadas ficam de fora
export const importStatement = async (formData: FormData) => {
  const res: ApiResult = await createItemNew({
    route: '/financial/conciliation/import',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  if (!res.success) return fail(res.message, null)
  return ok<{
    imported: number
    duplicates: number
    matched: number
    suggested: number
    unmatched: number
  }>(res.data)
}

const lineAction = async (
  id: string,
  action: 'confirm' | 'unmatch' | 'ignore' | 'match' | 'create' | 'liquidate',
  data?: unknown,
) => {
  const res: ApiResult = await createItemNew({
    route: `/financial/conciliation/line/${id}/${action}`,
    data,
  })
  return res.success ? ok(res.data) : fail(res.message, null)
}

export const confirmLine = async (id: string) => lineAction(id, 'confirm')
export const unmatchLine = async (id: string) => lineAction(id, 'unmatch')
export const ignoreLine = async (id: string) => lineAction(id, 'ignore')
export const matchLine = async (id: string, targetId: string) =>
  lineAction(id, 'match', { targetId })
// A linha só no extrato vira lançamento, com o plano de contas (CX-6.6)
export const createFromLine = async (
  id: string,
  values: { natureId: string; categoryId: string; description?: string },
) => lineAction(id, 'create', values)
// O depósito da operadora liquida o cartão; a diferença é a taxa (CX-6.7)
export const liquidateCard = async (
  id: string,
  values: { cardAccountId: string; gross: number },
) => lineAction(id, 'liquidate', values)
