// As condições de pagamento usadas pelo formulário, com cache, e o acréscimo
// de cada parcela calculado pela condição dela (lib/paymentFee). Antes cada
// componente buscava a condição e aplicava a taxa de um jeito: a taxa em %
// era somada como centavos e o valor por parcela era dividido entre elas.

import { toast } from 'sonner'

import { getItem } from '@/actions/_cruds'
import { installmentFee } from '@/lib/paymentFee'
import type { PaymentConditionsType } from '@/types/settings/paymentCondition'

type Result = {
  success: boolean
  data?: PaymentConditionsType
  message?: string
}

const cache = new Map<string, Promise<Result>>()

/** Esquece o cache: ao abrir o formulário, para pegar o que mudou no cadastro. */
export function forgetConditions() {
  cache.clear()
}

export function loadCondition(
  id?: string | null,
): Promise<PaymentConditionsType | null> {
  if (!id) return Promise.resolve(null)
  if (!cache.has(id)) {
    cache.set(
      id,
      getItem({ route: `/payment-condition/${id}` }).catch(() => ({
        success: false,
        message: '',
      })),
    )
  }
  return cache.get(id)!.then((res) => {
    if (!res.success || !res.data) {
      if (res.message) toast.error(res.message)
      return null
    }
    return res.data
  })
}

type Row = {
  paymentConditionId?: string
  amount?: number
  additionalFee?: number
}

/**
 * Recalcula o acréscimo de cada parcela pela forma de pagamento dela (ou a
 * principal): em %, sobre a parcela pela linha "Nx" da condição, N = total de
 * parcelas; em R$, o valor por parcela. Devolve as parcelas e a soma.
 */
export async function withFees<T extends Row | null | undefined>(
  rows: T[],
  mainConditionId?: string,
): Promise<{ rows: T[]; total: number }> {
  const qty = rows.length
  const conditions = await Promise.all(
    rows.map((row) =>
      row ? loadCondition(row.paymentConditionId || mainConditionId) : null,
    ),
  )
  const out = rows.map((row, index) => {
    if (!row) return row
    const condition = conditions[index]
    const additionalFee = condition
      ? installmentFee(condition, qty, Number(row.amount) || 0)
      : 0
    return { ...row, additionalFee }
  })

  // Em %, cada parcela arredondada pode perder um centavo da taxa sobre o
  // total (5% de R$ 50,00 em 3x: 0,83 × 3 = 2,49): a diferença vai para a
  // última parcela da mesma forma de pagamento
  const groups = new Map<string, number[]>()
  conditions.forEach((condition, index) => {
    if (!condition || condition.costType !== 'PERCENT' || !out[index]) return
    const key = condition.id
    groups.set(key, [...(groups.get(key) ?? []), index])
  })
  groups.forEach((indexes) => {
    const condition = conditions[indexes[0]]!
    const amounts = indexes.reduce(
      (sum: number, index: number) => sum + (Number(out[index]?.amount) || 0),
      0,
    )
    const expected = installmentFee(condition, qty, amounts)
    const charged = indexes.reduce(
      (sum: number, index: number) =>
        sum + (Number(out[index]?.additionalFee) || 0),
      0,
    )
    const last = out[indexes[indexes.length - 1]]
    if (last && expected !== charged) {
      last.additionalFee = (last.additionalFee || 0) + (expected - charged)
    }
  })

  const total = out.reduce(
    (sum, row) => sum + (Number(row?.additionalFee) || 0),
    0,
  )
  return { rows: out, total }
}
