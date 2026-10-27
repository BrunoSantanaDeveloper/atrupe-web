// Repasse da taxa da forma de pagamento ao cliente (o "Acréscimo" das
// parcelas do orçamento). Regra revista em 24/10/2026:
//
// - Taxa em % (cartão, link de pagamento): a operadora cobra pela quantidade
//   de parcelas da venda, não por parcela. A linha N da condição é a taxa da
//   venda em Nx, sobre o valor pago naquela forma. Sem a linha N, vale a
//   última cadastrada.
// - Taxa em R$ (boleto): um valor por parcela, cobrado em cada uma (cada
//   boleto). A condição guarda o mesmo valor em todas as linhas.
//
// A "Taxa operadora" (operatorFeeRate) é o custo da empresa e não entra aqui:
// fica guardada para o cálculo de custos do PRO. O "Repasse"
// (operatorFeeTransfer) é o que o cliente paga a mais.
//
// Valores em centavos, como o resto do orçamento; o percentual é o número
// digitado (3 = 3%).

export type FeeCondition = {
  costType: 'PERCENT' | 'VALUE'
  installments?: { installment?: number; operatorFeeTransfer: number }[]
}

const rowsOf = (condition: FeeCondition) =>
  [...(condition.installments ?? [])].sort(
    (a, b) => (a.installment ?? 0) - (b.installment ?? 0),
  )

/** O repasse que vale para a venda em `qty` parcelas: % ou centavos por parcela. */
export function transferOf(condition: FeeCondition, qty: number): number {
  const rows = rowsOf(condition)
  if (!rows.length) return 0
  if (condition.costType === 'VALUE') return rows[0].operatorFeeTransfer || 0
  const index = Math.min(Math.max(Math.round(qty) || 1, 1), rows.length) - 1
  return rows[index]?.operatorFeeTransfer || 0
}

/** O acréscimo de uma parcela de `amount` centavos numa venda em `qty` parcelas. */
export function installmentFee(
  condition: FeeCondition,
  qty: number,
  amount: number,
): number {
  const transfer = transferOf(condition, qty)
  if (!transfer) return 0
  if (condition.costType === 'VALUE') return Math.round(transfer)
  return Math.round(((amount || 0) * transfer) / 100)
}

/** Divide `total` centavos em `qty` parcelas inteiras; a diferença fica na última. */
export function splitCents(total: number, qty: number): number[] {
  const count = Math.max(Math.round(qty) || 1, 1)
  const each = Math.floor((total || 0) / count)
  return Array.from({ length: count }, (_, index) =>
    index === count - 1 ? (total || 0) - each * (count - 1) : each,
  )
}
