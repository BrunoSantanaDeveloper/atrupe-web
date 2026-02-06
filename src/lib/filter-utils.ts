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
  | 'current_month'
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

  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  const monthOffsets: Record<Exclude<PeriodType, 'custom'>, number> = {
    current_month: 0,
    last_6_months: 5,
    last_12_months: 11,
    last_24_months: 23,
    last_36_months: 35,
  }

  const offset = monthOffsets[period]
  const startDate = new Date(today.getFullYear(), today.getMonth() - offset, 1)

  return { startDate, endDate }
}

// ============================================
// URL PARAMS UTILITIES
// ============================================

interface UpdateParamsOptions {
  router: AppRouterInstance
  params: URLSearchParams
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

  if (!value || value === 'all') {
    params.delete(key)
  } else {
    params.set(key, value)
  }

  if (resetPage) params.delete('page')
  router.push(`?${params.toString()}`)
}

/**
 * Updates period params and navigates
 */
export function updatePeriodParams(
  period: PeriodType,
  options: UpdateParamsOptions,
) {
  const { router, params, resetPage = true } = options

  if (period === 'custom') {
    params.delete('startDate')
    params.delete('endDate')
    params.set('period', period)
  } else {
    const dates = calculatePeriodDates(period)
    if (dates) {
      params.set('startDate', formatDateToISO(dates.startDate))
      params.set('endDate', formatDateToISO(dates.endDate))
      params.set('period', period)
    }
  }

  if (resetPage) params.delete('page')
  router.push(`?${params.toString()}`)
}

/**
 * Updates date range params and navigates
 */
export function updateDateRangeParams(
  range: DateRange | undefined,
  options: UpdateParamsOptions,
) {
  const { router, params, resetPage = true } = options

  if (range?.from && range?.to) {
    params.set('startDate', formatDateToISO(range.from))
    params.set('endDate', formatDateToISO(range.to))
    params.set('period', 'custom')
  } else {
    params.delete('startDate')
    params.delete('endDate')
  }

  if (resetPage) params.delete('page')
  router.push(`?${params.toString()}`)
}
