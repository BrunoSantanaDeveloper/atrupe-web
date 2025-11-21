'use client'

// React
import { useRouter } from 'next/navigation'
import type { DateRange } from 'react-day-picker'

// Components
import { DateRangePickerBasic } from '@/components/common/form/DateRangePickerBasic'
import { SelectSerieField } from '@/components/common/form/global-inputs/SeriesSelectField'
import { SelectSellerField } from '@/components/common/form/global-inputs/SellersSelectField'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function QuotationsFilter({ searchParams }: SearchParamsType) {
  const router = useRouter()

  const searchParamsObject = new URLSearchParams(searchParams)
  const params = new URLSearchParams(searchParamsObject.toString())

  const hasUrlParams = searchParams?.startDate && searchParams?.endDate

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

  const getDefaultDateRange = (): DateRange | undefined => {
    if (hasUrlParams) {
      return {
        from: parseDateFromISO(searchParams.startDate!),
        to: parseDateFromISO(searchParams.endDate!),
      }
    }

    return undefined
  }

  const defaultDateRange = getDefaultDateRange()

  const handleFilter = (key: string, value: string) => {
    if (!value || value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    params.delete('page')

    router.push(`?${params.toString()}`)
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

  return (
    <>
      <DateRangePickerBasic
        label="Período"
        placeholder="Selecione o período"
        className="w-[220px]"
        value={defaultDateRange}
        onChange={handleDateRangeChange}
      />
      <SelectSerieField
        name="serie"
        label="Série"
        width="w-[220px]"
        noForm
        value={searchParams?.serieId || 'all'}
        onChange={(value) => handleFilter('serieId', value)}
      />
      <SelectSellerField
        name="seller"
        label="Vendedor"
        width="w-[220px]"
        noForm
        value={searchParams?.sellerId || 'all'}
        onChange={(value) => handleFilter('sellerId', value)}
      />
    </>
  )
}
