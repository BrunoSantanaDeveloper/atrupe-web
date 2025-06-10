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

  const dayOfWeek = daysOfWeek[utcDate.getDay()]
  const day = utcDate.getDate()
  const month = monthsOfYear[utcDate.getMonth()]
  const year = utcDate.getFullYear()

  return `${dayOfWeek}, ${day} de ${month} de ${year}`
}
