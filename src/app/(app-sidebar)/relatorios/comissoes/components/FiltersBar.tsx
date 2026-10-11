'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

// UI
import { Card, CardHeader } from '@/components/ui/card'
import { SelectBasic } from '@/components/common/form/FormSelect'
import { DateRangePickerBasic } from '@/components/common/form/DateRangePickerBasic'

// Mode
import { commissionModeOf, commissionModeCopy } from '../mode'

// Utils
import {
  getDateRangeFromParams,
  generateMonthPeriodOptions,
  updateFilterParam,
  updatePeriodParams,
  updateDateRangeParams,
  type PeriodType,
} from '@/lib/filter-utils'

// Actions
import { getSellers } from '@/actions/sales-report'

// Hooks
import { usePermissions } from '@/hooks/usePermissions'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function FiltersBar({ searchParams }: SearchParamsType) {
  const router = useRouter()
  const params = useSearchParams()
  const updateOptions = { router, params }

  const periodOptions = generateMonthPeriodOptions()

  const { hasAnyPermission } = usePermissions()
  // Cargos legados usam 'sale:other_sellers'; os salvos pela tela de cargos
  // usam 'sale:other_quotation'. Aceitar as duas chaves.
  const canSeeOtherSellers = hasAnyPermission([
    'sale:other_quotation:view',
    'sale:other_sellers:view',
  ])

  const { data: sellers = [] } = useQuery({
    queryKey: ['sellers'],
    queryFn: () => getSellers(),
    enabled: canSeeOtherSellers,
  })

  const sellerSelectOptions = [
    { value: 'all', label: 'Todos' },
    ...sellers.map((s) => ({ value: s.id, label: s.name })),
  ]

  const defaultSaleDateRange = getDateRangeFromParams(
    searchParams?.startDate as string,
    searchParams?.endDate as string,
  )

  // Um período só: o modo decide se ele é a data da venda ou a do
  // recebimento. Dois filtros de data juntos deixavam o resultado ambíguo
  const mode = commissionModeOf(searchParams?.commissionType as string)

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
          label={commissionModeCopy[mode].dateLabel}
          placeholder="Selecione um período"
          className="lg:w-[260px] w-full"
          value={defaultSaleDateRange}
          onChange={(range) => updateDateRangeParams(range, updateOptions)}
        />
        {canSeeOtherSellers && (
          <SelectBasic
            name="sellerId"
            label="Vendedor"
            placeholder="Selecione um vendedor"
            className="lg:w-[200px] w-full"
            options={sellerSelectOptions}
            value={(searchParams?.sellerId as string) || 'all'}
            onChange={(value) =>
              updateFilterParam('sellerId', value, updateOptions)
            }
          />
        )}
      </CardHeader>
    </Card>
  )
}
