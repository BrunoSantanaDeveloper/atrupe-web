/**
 * Geometria dos rankings do relatório de vendas (RankingBarChart).
 *
 * Mede texto em pixels com a fonte real em vez de contar caracteres. Contar
 * caracteres foi a primeira tentativa e falhou em produção: a Inter é
 * proporcional, então "BANNER POR METRO QUADRADO" (M, Q e D largos) passa da
 * largura do eixo com os mesmos 25 caracteres com que "FLYBANNER 200X60CM" cabe.
 *
 * Sem React e sem imports do app: roda igual no componente e no teste de
 * navegador que mede o resultado renderizado.
 */

export interface RankingItem {
  name: string
  value: number
}

export type MeasureText = (text: string) => number

/** Tamanho dos textos do gráfico (eixo e valor na ponta da barra). */
export const LABEL_FONT_SIZE = 12

/**
 * O recharts desenha o tick do eixo esquerdo tickSize (6) + tickMargin (2)
 * antes da borda direita do eixo — é o quanto a largura útil do rótulo perde.
 */
export const AXIS_TICK_OFFSET = 8

/** Distância entre a ponta da barra e o valor. */
export const VALUE_LABEL_OFFSET = 8

/** Folga contra as bordas do SVG, para arredondamento de subpixel. */
const SAFETY_PAD = 4

/** O eixo ocupa até 40% da largura do gráfico, entre 96px e 200px. */
const AXIS_WIDTH_RATIO = 0.4
const AXIS_MIN_WIDTH = 96
const AXIS_MAX_WIDTH = 200

const ELLIPSIS = '…'

/** Sem quebra: "R$ 1,2 mil" não pode virar três linhas em nenhum renderer. */
const NBSP = '\u00a0'

/**
 * Estimativa usada antes de a fonte ser conhecida e no servidor. Larga de
 * propósito (0,7em por caractere): truncar um pouco a mais é melhor do que
 * deixar texto vazar pela borda.
 */
export const estimateTextWidth: MeasureText = (text) =>
  text.length * LABEL_FONT_SIZE * 0.7

/**
 * Mede com canvas usando a mesma fonte do SVG. Se o canvas recusar a string
 * de fonte, ele mantém "10px sans-serif" em silêncio e mediria tudo menor —
 * nesse caso cai na estimativa em vez de confiar num número errado.
 */
export function createCanvasMeasurer(font: string): MeasureText {
  const context =
    typeof document === 'undefined'
      ? null
      : document.createElement('canvas').getContext('2d')

  if (!context) return estimateTextWidth

  context.font = font
  if (!context.font.includes(`${LABEL_FONT_SIZE}px`)) return estimateTextWidth

  const cache = new Map<string, number>()

  return (text) => {
    const cached = cache.get(text)
    if (cached !== undefined) return cached

    const width = context.measureText(text).width
    cache.set(text, width)
    return width
  }
}

/** Maior prefixo de `text` que, com reticências, cabe em `maxWidth`. */
export function truncateToWidth(
  text: string,
  maxWidth: number,
  measure: MeasureText,
) {
  if (measure(text) <= maxWidth) return text
  if (measure(ELLIPSIS) > maxWidth) return ''

  let low = 0
  let high = text.length - 1

  while (low < high) {
    const mid = Math.ceil((low + high) / 2)

    if (measure(`${text.slice(0, mid).trimEnd()}${ELLIPSIS}`) <= maxWidth) {
      low = mid
    } else {
      high = mid - 1
    }
  }

  return `${text.slice(0, low).trimEnd()}${ELLIPSIS}`
}

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const oneDecimal = (value: number) =>
  value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })

/**
 * Valor compacto para a ponta da barra: "R$ 12,3 mil" ocupa metade de
 * "R$ 12.345,67". O valor exato fica no tooltip e na visão expandida.
 */
export function formatCompactBrl(valueInCents: number) {
  const value = (Number(valueInCents) || 0) / 100

  if (Math.abs(value) < 1_000) return brl.format(value)

  // Arredonda antes de escolher a unidade: 999.960 sairia "1.000 mil".
  const thousands = Math.round(value / 100) / 10
  if (Math.abs(thousands) < 1_000) {
    return `R$${NBSP}${oneDecimal(thousands)}${NBSP}mil`
  }

  return `R$${NBSP}${oneDecimal(value / 1_000_000)}${NBSP}mi`
}

export interface RankingLayout {
  /** Largura do eixo Y, onde ficam os nomes. */
  axisWidth: number
  /** Margem direita do gráfico: o tamanho do maior valor impresso na ponta. */
  rightMargin: number
  /** Nome exibido no eixo para um nome completo. */
  labelFor: (name: string) => string
}

export function computeRankingLayout(
  items: RankingItem[],
  chartWidth: number,
  measure: MeasureText,
  formatValue: (value: number) => string = formatCompactBrl,
): RankingLayout {
  const axisCap = Math.min(
    AXIS_MAX_WIDTH,
    Math.max(AXIS_MIN_WIDTH, Math.round(chartWidth * AXIS_WIDTH_RATIO)),
  )

  // Nomes todos curtos encolhem o eixo e devolvem a sobra para as barras.
  const widestName = Math.max(0, ...items.map((item) => measure(item.name)))
  const axisWidth = Math.min(
    axisCap,
    Math.ceil(widestName + AXIS_TICK_OFFSET + SAFETY_PAD),
  )
  const maxLabelWidth = axisWidth - AXIS_TICK_OFFSET - SAFETY_PAD

  const labels = new Map(
    items.map((item) => [
      item.name,
      truncateToWidth(item.name, maxLabelWidth, measure),
    ]),
  )

  // A barra mais longa encosta na borda do gráfico, então o maior valor
  // precisa caber inteiro na margem; os demais começam antes e cabem também.
  const widestValue = Math.max(
    0,
    ...items.map((item) => measure(formatValue(item.value))),
  )

  return {
    axisWidth,
    rightMargin: Math.ceil(widestValue + VALUE_LABEL_OFFSET + SAFETY_PAD),
    labelFor: (name) =>
      labels.get(name) ?? truncateToWidth(name, maxLabelWidth, measure),
  }
}
