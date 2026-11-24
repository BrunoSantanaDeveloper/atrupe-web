// Os números digitados numa caixa de texto, no costume brasileiro
// (24/11/2026). Sem 'use server': serve a qualquer tela.

/**
 * O número digitado. Com vírgula, a vírgula é o decimal e o ponto é o milhar
 * ("45.320,5" → 45320,5). Sem vírgula, o ponto seguido de exatamente três
 * dígitos é o milhar ("45.320" → 45320; "1.234.567" → 1234567) e outro ponto
 * é o decimal ("2.5" → 2,5; "12.50" → 12,5).
 *
 * Devolve `undefined` no campo vazio e `null` no que não é número ("12a",
 * "1,2,3", "4.53.2"), para a tela recusar com o motivo em vez de mandar.
 */
export function parseTypedNumber(value: string): number | null | undefined {
  const text = String(value ?? '').replace(/\s/g, '')
  if (!text) return undefined
  let normalized: string
  if (text.includes(',')) {
    if (!/^-?(\d*|\d{1,3}(\.\d{3})+),\d*$/.test(text)) return null
    normalized = text.replace(/\./g, '').replace(',', '.')
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(text)) {
    normalized = text.replace(/\./g, '')
  } else {
    if (!/^-?(\d+(\.\d*)?|\.\d+)$/.test(text)) return null
    normalized = text
  }
  const number = Number(normalized)
  return Number.isFinite(number) ? number : null
}

/**
 * Os minutos digitados: um inteiro ("90") ou horas e minutos ("1h30",
 * "1:30", "2h", "1h30min"). Devolve `undefined` no campo vazio e `null` no
 * que não dá para ler: decimal ("1,5", "90.5"), letra solta ou os minutos
 * da hora acima de 59.
 */
export function parseTypedMinutes(value: string): number | null | undefined {
  const text = String(value ?? '')
    .replace(/\s/g, '')
    .toLowerCase()
  if (!text) return undefined
  if (/^\d+$/.test(text)) return Number(text)
  const match =
    text.match(/^(\d+)h(\d{1,2})?(m|min)?$/) || text.match(/^(\d+):(\d{2})$/)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2] || 0)
  if (minutes > 59) return null
  return hours * 60 + minutes
}
