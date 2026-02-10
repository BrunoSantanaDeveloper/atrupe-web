import type { DateRange } from 'react-day-picker'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { formatDateToISO, parseDateFromISO } from './formatDate'

// Re-export date utilities from centralized location
export { formatDateToISO, parseDateFromISO } from './formatDate'

/**
 * Creates a DateRange from URL search params
 */
export function getDateRangeFromParams(
  startDate?: string,
  endDate?: string,
): DateRange | undefined {
  if (!startDate || !endDate) return undefined

  return {
    from: parseDateFromISO(startDate),
    to: parseDateFromISO(endDate),
  }
}

// ============================================
// PERIOD CALCULATION
// ============================================

export type PeriodType =
  | 'today'
  | '7days'
  | '15days'
  | 'thisMonth'
  | 'lastMonth'
  | 'current_month'
  | 'last_month'
  | 'penultimate_month'
  | 'next_month'
  | 'next_3_months'
  | 'next_6_months'
  | 'last_6_months'
  | 'last_12_months'
  | 'last_24_months'
  | 'last_36_months'
  | 'custom'

interface PeriodDateRange {
  startDate: Date
  endDate: Date
}

/**
 * Calculates date range for a given period type
 * Returns null for 'custom' period
 */
export function calculatePeriodDates(
  period: PeriodType,
): PeriodDateRange | null {
  if (period === 'custom') return null

  const today = new Date()
  today.setHours(12, 0, 0, 0)

  // Day-based periods
  if (period === 'today') {
    return { startDate: new Date(today), endDate: new Date(today) }
  }

  if (period === '7days') {
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 7)
    return { startDate, endDate: new Date(today) }
  }

  if (period === '15days') {
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 15)
    return { startDate, endDate: new Date(today) }
  }

  // Normalize aliases
  const normalized =
    period === 'thisMonth'
      ? 'current_month'
      : period === 'lastMonth'
        ? 'last_month'
        : period

  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  const monthOffsets: Record<string, number> = {
    current_month: 0,
    last_month: 1,
    penultimate_month: 2,
    last_6_months: 5,
    last_12_months: 11,
    last_24_months: 23,
    last_36_months: 35,
  }

  const offset = monthOffsets[normalized]
  if (offset === undefined) {
    // Handle future period types
    if (normalized === 'next_month') {
      const startDate = new Date(today.getFullYear(), today.getMonth() + 1, 1)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0)
      return { startDate, endDate: monthEnd }
    }
    if (normalized === 'next_3_months') {
      const startDate = new Date(today)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 3, 0)
      return { startDate, endDate: monthEnd }
    }
    if (normalized === 'next_6_months') {
      const startDate = new Date(today)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 6, 0)
      return { startDate, endDate: monthEnd }
    }
    return null
  }

  const startDate = new Date(today.getFullYear(), today.getMonth() - offset, 1)

  // For single-month periods, end date is last day of that specific month
  if (
    ['current_month', 'last_month', 'penultimate_month'].includes(normalized)
  ) {
    const monthEndDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0,
    )
    return { startDate, endDate: monthEndDate }
  }

  return { startDate, endDate }
}

// ============================================
// PERIOD OPTIONS GENERATION
// ============================================

const MONTH_NAMES_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

/**
 * Generates dynamic period options with month names
 * Example output for February 2026:
 * - Fevereiro de 2026 (Mês atual)
 * - Janeiro de 2026 (Último mês)
 * - Dezembro de 2025 (Penúltimo mês)
 * - Personalizado
 */
export function generateMonthPeriodOptions() {
  const today = new Date()

  const getMonthLabel = (offset: number) => {
    const date = new Date(today.getFullYear(), today.getMonth() - offset, 1)
    return `${MONTH_NAMES_PT[date.getMonth()]} de ${date.getFullYear()}`
  }

  return [
    { value: 'current_month', label: `${getMonthLabel(0)} (Mês atual)` },
    { value: 'last_month', label: `${getMonthLabel(1)} (Último mês)` },
    {
      value: 'penultimate_month',
      label: `${getMonthLabel(2)} (Penúltimo mês)`,
    },
    { value: 'custom', label: 'Personalizado' },
  ]
}

// ============================================
// URL PARAMS UTILITIES
// ============================================

interface UpdateParamsOptions {
  router: AppRouterInstance
  params: URLSearchParams | { toString(): string }
  resetPage?: boolean
}

/**
 * Updates a single filter param and navigates
 */
export function updateFilterParam(
  key: string,
  value: string,
  options: UpdateParamsOptions,
) {
  const { router, params, resetPage = true } = options
  const newParams = new URLSearchParams(params.toString())

  if (!value || value === 'all') {
    newParams.delete(key)
  } else {
    newParams.set(key, value)
  }

  if (resetPage) newParams.delete('page')
  router.push(`?${newParams.toString()}`)
}

/**
 * Updates period params and navigates
 */
export function updatePeriodParams(
  period: PeriodType,
  options: UpdateParamsOptions,
) {
  const { router, params, resetPage = true } = options
  const newParams = new URLSearchParams(params.toString())

  if (period === 'custom') {
    newParams.delete('startDate')
    newParams.delete('endDate')
    newParams.set('period', period)
  } else {
    const dates = calculatePeriodDates(period)
    if (dates) {
      newParams.set('startDate', formatDateToISO(dates.startDate))
      newParams.set('endDate', formatDateToISO(dates.endDate))
      newParams.set('period', period)
    }
  }

  if (resetPage) newParams.delete('page')
  router.push(`?${newParams.toString()}`)
}

/**
 * Updates date range params and navigates
 */
export function updateDateRangeParams(
  range: DateRange | undefined,
  options: UpdateParamsOptions,
) {
  const { router, params, resetPage = true } = options
  const newParams = new URLSearchParams(params.toString())

  if (range?.from && range?.to) {
    newParams.set('startDate', formatDateToISO(range.from))
    newParams.set('endDate', formatDateToISO(range.to))
    newParams.set('period', 'custom')
  } else {
    newParams.delete('startDate')
    newParams.delete('endDate')
  }

  if (resetPage) newParams.delete('page')
  router.push(`?${newParams.toString()}`)
}
