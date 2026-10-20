// Formatação de número, moeda, percentual e data pelo idioma do usuário
// (07/10/2026). Substitui, na ligação, os usos fixos de 'pt-BR' e de
// formatCurrencyToBrl. A moeda é sempre um parâmetro: quem decide a moeda é
// a empresa (país), não o idioma do usuário.
import { INTL_LOCALE, isLocale, type Locale } from './config'

/**
 * Idioma do usuário ou uma localidade regional completa. O separador de
 * milhar e de decimal é regional: em espanhol, o Paraguai e a Argentina usam
 * ponto no milhar ('es-PY', 'es-AR') e o México usa vírgula ('es-MX'). Quando o
 * projeto de país existir, a empresa informa a localidade regional e ela é
 * passada aqui no lugar do idioma.
 */
export type FormatLocale = Locale | (string & Record<never, never>)

const tag = (locale: FormatLocale) =>
  isLocale(locale) ? INTL_LOCALE[locale] : locale

export type CurrencyCode =
  | 'BRL'
  | 'USD'
  | 'EUR'
  | 'PYG'
  | 'UYU'
  | 'ARS'
  | 'CLP'
  | 'COP'
  | 'MXN'
  | 'PEN'
  | 'BOB'
  | (string & Record<never, never>)

export function formatNumber(
  value: number,
  locale: FormatLocale,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(tag(locale), options).format(value)
}

/** Número com casas fixas, ex.: área em m² ou quantidade fracionada. */
export function formatDecimal(
  value: number,
  locale: FormatLocale,
  fractionDigits = 2,
): string {
  return formatNumber(value, locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
}

export function formatCurrency(
  value: number,
  locale: FormatLocale,
  currency: CurrencyCode,
): string {
  return new Intl.NumberFormat(tag(locale), {
    style: 'currency',
    currency,
  }).format(value)
}

/** Percentual a partir do número já em pontos percentuais (45 → "45%"). */
export function formatPercent(
  value: number,
  locale: FormatLocale,
  fractionDigits = 0,
): string {
  return new Intl.NumberFormat(tag(locale), {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(value / 100)
}

export type DateStyle = 'curta' | 'media' | 'longa' | 'dataHora' | 'hora'

const DATE_OPTIONS: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  curta: { day: '2-digit', month: '2-digit', year: 'numeric' },
  media: { day: '2-digit', month: 'short', year: 'numeric' },
  longa: { day: 'numeric', month: 'long', year: 'numeric' },
  dataHora: {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  },
  hora: { hour: '2-digit', minute: '2-digit' },
}

export function formatDate(
  value: Date | string | number,
  locale: FormatLocale,
  style: DateStyle = 'curta',
  timeZone?: string,
): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(tag(locale), {
    ...DATE_OPTIONS[style],
    timeZone,
  }).format(date)
}

/** "há 3 dias", "hace 3 días", "3 days ago". */
export function formatRelative(
  value: Date | string | number,
  locale: FormatLocale,
  now: Date = new Date(),
): string {
  const date = value instanceof Date ? value : new Date(value)
  const diff = (date.getTime() - now.getTime()) / 1000
  const rtf = new Intl.RelativeTimeFormat(tag(locale), {
    numeric: 'auto',
  })
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, seconds] of steps)
    if (Math.abs(diff) >= seconds)
      return rtf.format(Math.round(diff / seconds), unit)
  return rtf.format(Math.round(diff), 'second')
}
