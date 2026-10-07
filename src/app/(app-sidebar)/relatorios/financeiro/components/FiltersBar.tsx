'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/hooks/useRouter'

// UI
import { Card, CardHeader } from '@/components/ui/card'
import { SelectBasic } from '@/components/common/form/FormSelect'
import { DateRangePickerBasic } from '@/components/common/form/DateRangePickerBasic'
import { AsyncSelectBasic } from '@/components/common/form/AsyncSelectBasic'

// Config
import { periodOptions } from '../config'

// Utils
import {
  getDateRangeFromParams,
  updateFilterParam,
  updatePeriodParams,
  updateDateRangeParams,
  type PeriodType,
} from '@/lib/filter-utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { FinancialTab } from '../types'

interface FiltersBarProps extends SearchParamsType {
  tab: FinancialTab
}

interface Option {
  value: string
  label: string
}

export function FiltersBar({ searchParams, tab }: FiltersBarProps) {
  const router = useRouter()
  const params = useSearchParams()
  const updateOptions = { router, params }
  const [selectedEntity, setSelectedEntity] = useState<Option | null>(null)

  const defaultDateRange = getDateRangeFromParams(
    searchParams?.startDate as string,
    searchParams?.endDate as string,
  )
  const isReceitas = tab === 'receitas'

  useEffect(() => {
    setSelectedEntity(null)
  }, [tab])

  return (
    <Card className="hidden lg:block">
      <CardHeader className="flex-row flex-wrap space-y-0 gap-4">
        <AsyncSelectBasic
          key={tab}
          route={isReceitas ? '/client' : '/supplier'}
          label={isReceitas ? 'Cliente' : 'Fornecedor'}
          placeholder={
            isReceitas ? 'Todos os clientes' : 'Todos os fornecedores'
          }
          width="lg:w-[260px] w-full"
          minChars={1}
          value={selectedEntity}
          onChange={(option) => {
            setSelectedEntity(option)
            updateFilterParam('clientId', option?.value || 'all', updateOptions)
          }}
        />
        <SelectBasic
          name="period"
          label="Período"
          placeholder="Selecione o período"
          className="lg:w-[200px] w-full"
          options={periodOptions}
          value={(searchParams?.period as string) || 'thisMonth'}
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
