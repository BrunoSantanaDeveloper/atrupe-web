// Limite de desconto do vendedor sobre o preço base do cadastro (ALT-8, EC-2)
//
// - A referência é o preço base do item (basePrice, em centavos, na medida
//   e na quantidade do item), nunca o preço editado no orçamento: baixar o
//   preço do item conta como desconto.
// - O limite vale sobre o total do orçamento: a soma das bases contra tudo o
//   que ficou abaixo delas, mais o desconto geral das condições. Subir um item
//   e descontar outro não muda o total (é apresentação, decisão de 24/09).
// - O acréscimo e as linhas acrescentadas ficam fora (ALT-25, ORC-5).
// - Produto sem preço base (preço R$ 0,00, basePrice nulo) não tem limite:
//   fica fora da conta (ALT-8, item 3).

export type DiscountLimitItem = {
  id?: string
  totalValue?: number
  finalValue?: number
  addition?: number
  linesTotal?: number
  basePrice?: number | null
}

/** O que o item vale sem o acréscimo e as linhas, depois dos descontos. */
const effectiveOf = (item: DiscountLimitItem) =>
  (item.finalValue || 0) - (item.addition || 0) - (item.linesTotal || 0)

/**
 * Percentual de desconto do orçamento sobre a soma dos preços base.
 * `current` troca o valor de um item pelo que está sendo editado na tela.
 */
export function discountOverBase(
  items: DiscountLimitItem[],
  generalDiscount = 0,
  current?: { id?: string; effective: number },
) {
  let base = 0
  let effective = 0
  for (const item of items) {
    const itemBase = item.basePrice ?? 0
    if (itemBase <= 0) continue
    base += itemBase
    effective +=
      current && item.id === current.id ? current.effective : effectiveOf(item)
  }
  // Item acima da base compensa desconto em outro ou no geral (o total é o
  // que conta)
  const discount = Math.max(base - effective + (generalDiscount || 0), 0)
  const percentage =
    base > 0
      ? Math.round(((discount / base) * 100 + Number.EPSILON) * 100) / 100
      : 0
  return { base, discount, percentage }
}
