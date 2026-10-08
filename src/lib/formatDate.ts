// ============================================
// URL PARAM DATE UTILITIES
// ============================================

/**
 * Formats a Date to ISO string (YYYY-MM-DD) for URL params
 * Manually formatted to avoid timezone issues
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parses an ISO date string (YYYY-MM-DD) to Date
 * Sets time to noon to avoid timezone issues
 */
export function parseDateFromISO(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day, 12, 0, 0, 0)
}

// ============================================
// LOCALE DATE UTILITIES
// ============================================

// Returns 12/03/2024
export function formatToLocaleDate(date: string | Date | undefined) {
  if (!date) return '-'

  const utcDate = new Date(date)
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }
  const newDate = utcDate.toLocaleDateString('pt-BR', options)
  return newDate
}

// Returns 12/03/2024 for a calendar date stored either as a pure date or as an
// instant. Pure dates (a due date, a payment date from Asaas) are saved at
// midnight UTC and read in UTC — in Sao Paulo time they would fall on the
// previous day. Anything else is an instant (e.g. a confirmation recorded at
// the moment of payment) and keeps the Sao Paulo time zone.
export function formatToCalendarDate(date: string | Date | null | undefined) {
  if (!date) return '-'

  const value = new Date(date)
  if (Number.isNaN(value.getTime())) return '-'

  const isPureDate =
    value.getUTCHours() === 0 &&
    value.getUTCMinutes() === 0 &&
    value.getUTCSeconds() === 0 &&
    value.getUTCMilliseconds() === 0

  return value.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: isPureDate ? 'UTC' : 'America/Sao_Paulo',
  })
}

// Returns 12/03/24
export function formatToLocaleShortDate(date: string) {
  if (!date) return '-'

  const utcDate = new Date(date)
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }
  const newDate = utcDate.toLocaleDateString('pt-BR', options)
  return newDate
}

// Returns 12/03/2024, 12:34:56
export function formatToLocaleDateTime(date?: string | Date) {
  if (!date) return '-'

  const newDate = new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })

  return newDate
}

// Returns 12 de março de 2024, 12:34:56
export function formatToLocaleLongDateTime(date?: string | Date) {
  if (!date) return '-'

  const newDate = new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })

  return newDate
}

// Returns 2024/03/12
export function formatToInputDate(date: string) {
  if (!date) return '-'

  const newDate = new Date(date).toISOString().slice(0, 10)

  return newDate
}

// Returns 2024-03-12T12:34:56.000Z
export function formatToIsoDate(date: string) {
  if (!date) return '-'

  const newDate = new Date(date).toISOString()

  return newDate
}

// Returns Quarta-feira, 22 de maio de 2024
export function formatToWeekDate(date: string) {
  if (!date) return '-'

  const daysOfWeek = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ]
  const monthsOfYear = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ]

  const utcDate = new Date(date)

  const dayOfWeek = daysOfWeek[utcDate.getUTCDay()]
  const day = utcDate.getUTCDate()
  const month = monthsOfYear[utcDate.getUTCMonth()]
  const year = utcDate.getUTCFullYear()

  return `${dayOfWeek}, ${day} de ${month} de ${year}`
}
