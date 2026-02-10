'use client'

import { useRouter, useSearchParams } from 'next/navigation'

// UI
import { Card, CardHeader } from '@/components/ui/card'
import { SelectBasic } from '@/components/common/form/FormSelect'
import { DateRangePickerBasic } from '@/components/common/form/DateRangePickerBasic'

// Config
import { periodOptions } from '../config'

// Utils
import {
  getDateRangeFromParams,
  updatePeriodParams,
  updateDateRangeParams,
  type PeriodType,
} from '@/lib/filter-utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function FiltersBar({ searchParams }: SearchParamsType) {
  const router = useRouter()
  const params = useSearchParams()
  const updateOptions = { router, params }

  const defaultDateRange = getDateRangeFromParams(
    searchParams?.startDate as string,
    searchParams?.endDate as string,
  )

  return (
    <Card className="hidden lg:block">
      <CardHeader className="flex-row flex-wrap space-y-0 gap-4">
        <SelectBasic
          name="period"
          label="Período"
          placeholder="Selecione o período"
          className="lg:w-[200px] w-full"
          options={periodOptions}
          value={(searchParams?.period as string) || 'current_month'}
          onChange={(value) =>
            updatePeriodParams(value as PeriodType, updateOptions)
          }
        />
        <DateRangePickerBasic
          label="Período personalizado"
          placeholder="Selecione um período"
          className="lg:w-[260px] w-full"
          value={defaultDateRange}
          onChange={(range) => updateDateRangeParams(range, updateOptions)}
        />
      </CardHeader>
    </Card>
  )
}
