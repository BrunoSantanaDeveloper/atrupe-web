'use client'

import { useRouter } from 'next/navigation'
import type { DateRange } from 'react-day-picker'

// Components
import { DateRangePickerBasic } from '@/components/common/form/DateRangePickerBasic'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function InvoiceFilter({ searchParams }: SearchParamsType) {
  const router = useRouter()

  const params = new URLSearchParams(searchParams as Record<string, string>)

  const formatDateToISO = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const parseDateFromISO = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day, 12, 0, 0, 0)
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      params.set('startDate', formatDateToISO(range.from))
      params.set('endDate', formatDateToISO(range.to))
    } else {
      params.delete('startDate')
      params.delete('endDate')
    }

    params.delete('page')

    router.push(`?${params.toString()}`)
  }

  const defaultDateRange: DateRange | undefined =
    searchParams?.startDate && searchParams?.endDate
      ? {
          from: parseDateFromISO(searchParams.startDate as string),
          to: parseDateFromISO(searchParams.endDate as string),
        }
      : undefined

  return (
    <div className="w-[220px]">
      <DateRangePickerBasic
        label="Período"
        placeholder="Selecione um período"
        value={defaultDateRange}
        onChange={handleDateRangeChange}
      />
    </div>
  )
}
