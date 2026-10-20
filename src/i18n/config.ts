// Variação de idioma (07/10/2026). Biblioteca preparada em paralelo:
// nada no sistema importa este arquivo ainda. A ligação às telas está
// descrita em src/i18n/LIGACAO.md.
//
// Idioma é escolha do USUÁRIO; país (moeda, documento, fiscal) é da
// EMPRESA e é outro projeto (openspec, área 10). Por isso a moeda nunca
// sai do idioma: ela é sempre passada para as funções de formatação.

export const LOCALES = ['pt-BR', 'es', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'pt-BR'

/** Rótulo de cada idioma no próprio idioma, para o seletor. */
export const LOCALE_LABELS: Record<Locale, string> = {
  'pt-BR': 'Português (Brasil)',
  es: 'Español',
  en: 'English',
}

/**
 * Localidade usada pelo Intl para número e data. O espanhol usa a
 * variante latino-americana (es-419); o inglês, a americana.
 */
export const INTL_LOCALE: Record<Locale, string> = {
  'pt-BR': 'pt-BR',
  es: 'es-419',
  en: 'en-US',
}

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
  )
}

/** Escolhe o idioma: preferência do usuário, depois o navegador, depois o padrão. */
export function resolveLocale(
  userPreference?: string | null,
  acceptLanguage?: string | null,
): Locale {
  if (isLocale(userPreference)) return userPreference
  for (const part of (acceptLanguage ?? '').split(',')) {
    const tag = part.split(';')[0].trim().toLowerCase()
    if (tag.startsWith('pt')) return 'pt-BR'
    if (tag.startsWith('es')) return 'es'
    if (tag.startsWith('en')) return 'en'
  }
  return DEFAULT_LOCALE
}
