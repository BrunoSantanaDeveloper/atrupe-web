'use client'

import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/hooks/useRouter'

// UI
import { Card, CardHeader } from '@/components/ui/card'
import { SelectBasic } from '@/components/common/form/FormSelect'
import { DateRangePickerBasic } from '@/components/common/form/DateRangePickerBasic'

// Config
import { REGIME_OPTIONS, PERIOD_OPTIONS } from '../config'

// Utils
import {
  getDateRangeFromParams,
  updatePeriodParams,
  updateDateRangeParams,
  updateFilterParam,
  type PeriodType,
} from '@/lib/filter-utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function FiltersBar({ searchParams }: SearchParamsType) {
  const router = useRouter()
  const params = useSearchParams()
  const updateOptions = { router, params }

  const currentRegime = (searchParams?.regime as string) || 'competencia'

  const defaultDateRange = getDateRangeFromParams(
    searchParams?.startDate as string,
    searchParams?.endDate as string,
  )

  const handleRegimeChange = (value: string) => {
    updateFilterParam('regime', value, updateOptions)
  }

  return (
    <Card className="hidden lg:block">
      <CardHeader className="flex-row flex-wrap space-y-0 gap-4">
        <SelectBasic
          name="regime"
          label="Regime"
          placeholder="Selecione o regime"
          className="lg:w-[160px] w-full"
          options={REGIME_OPTIONS}
          value={currentRegime}
          onChange={handleRegimeChange}
        />
        <SelectBasic
          name="period"
          label="Período"
          placeholder="Selecione o período"
          className="lg:w-[200px] w-full"
          options={PERIOD_OPTIONS}
          value={(searchParams?.period as string) || 'current_month'}
          onChange={(value) =>
            updatePeriodParams(value as PeriodType, updateOptions)
          }
        />
        <DateRangePickerBasic
          label="Período personalizado"
          placeholder="Selecione o período"
          className="lg:w-[260px] w-full"
          value={defaultDateRange}
          onChange={(range) => updateDateRangeParams(range, updateOptions)}
        />
      </CardHeader>
    </Card>
  )
}
