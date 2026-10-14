'use client'

// React
import { useRouter } from 'next/navigation'
import type { DateRange } from 'react-day-picker'

// Components
import { DateRangePickerBasic } from '@/components/common/form/DateRangePickerBasic'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { SelectBasic } from '@/components/common/form/FormSelect'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import { InUsePaymentConditionsSelectField } from '@/components/common/form/global-inputs/InUsePaymentConditionsSelectField'
import { InUseBankAccountsSelectField } from '@/components/common/form/global-inputs/InUseBankAccountsSelectField'

// Utils
import {
  calculatePeriodDates,
  formatDateToISO,
  parseDateFromISO,
  type PeriodType,
} from '@/lib/filter-utils'

const PERIOD_OPTIONS = [
  { value: 'current_month', label: 'Mês atual' },
  { value: 'last_month', label: 'Mês passado' },
  { value: 'next_7_days', label: 'Próximos 7 dias' },
  { value: 'next_30_days', label: 'Próximos 30 dias' },
  { value: 'custom', label: 'Personalizado' },
]

export function FinancialFlowFilter({ searchParams }: SearchParamsType) {
  const router = useRouter()

  const searchParamsObject = new URLSearchParams(searchParams)
  const params = new URLSearchParams(searchParamsObject.toString())

  const { canCreateBankAccount, canProvision } = usePlanFeatures()

  const currentPeriod = (searchParams?.period as string) || ''
  const isCustomPeriod =
    currentPeriod === 'custom' ||
    (!currentPeriod && (searchParams?.startDate || searchParams?.endDate))

  const defaultDateRange: DateRange | undefined =
    searchParams?.startDate && searchParams?.endDate
      ? {
          from: parseDateFromISO(searchParams.startDate as string),
          to: parseDateFromISO(searchParams.endDate as string),
        }
      : undefined

  const handleFilter = (key: string, value: string) => {
    if (!value || value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    params.delete('page')

    router.push(`?${params.toString()}`)
  }

  const handlePeriodChange = (period: string) => {
    params.set('period', period)
    params.delete('page')

    if (period === 'custom') {
      router.push(`?${params.toString()}`)
      return
    }

    const dates = calculatePeriodDates(period as PeriodType)
    if (dates) {
      params.set('startDate', formatDateToISO(dates.startDate))
      params.set('endDate', formatDateToISO(dates.endDate))
    }

    router.push(`?${params.toString()}`)
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    params.set('period', 'custom')

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
    <PermissionGate permissions={['financial:flow:edit']}>
      <>
        <SelectBasic
          name="period"
          label="Período"
          placeholder="Selecione o período"
          className="w-full sm:w-[200px]"
          options={PERIOD_OPTIONS}
          value={currentPeriod || ''}
          onChange={handlePeriodChange}
        />
        {isCustomPeriod && (
          <DateRangePickerBasic
            label="Período personalizado"
            placeholder="Selecione o período"
            className="w-full sm:w-[220px]"
            value={defaultDateRange}
            onChange={handleDateRangeChange}
          />
        )}
        {canCreateBankAccount() && (
          <InUseBankAccountsSelectField
            noForm
            name="bankAccountId"
            placeholder="Selecione uma conta"
            value={searchParams?.bankAccountId || 'all'}
            additionalOnChange={(value) => handleFilter('bankAccountId', value)}
            width="w-full sm:w-[220px]"
          />
        )}
        <SelectBasic
          name="status"
          label="Status"
          placeholder="Selecione o status"
          className="w-full sm:w-[220px]"
          options={[
            { value: 'all', label: 'Todas' },
            { value: 'PENDING', label: 'Em aberto' },
            { value: 'PAID', label: 'Pago' },
            { value: 'PROVISIONED', label: 'Provisionado' },
            { value: 'OVERDUE', label: 'Atrasado' },
            { value: 'CANCELED', label: 'Cancelado' },
          ].filter((opt) => canProvision() || opt.value !== 'PROVISIONED')}
          value={searchParams?.status || 'all'}
          onChange={(value) => handleFilter('status', value)}
        />
        <InUsePaymentConditionsSelectField
          noForm
          name="paymentConditionId"
          placeholder="Selecione uma forma de pagamento"
          value={searchParams?.paymentConditionId || 'all'}
          additionalOnChange={(value) =>
            handleFilter('paymentConditionId', value)
          }
          width="w-full sm:w-[220px]"
        />
      </>
    </PermissionGate>
  )
}
