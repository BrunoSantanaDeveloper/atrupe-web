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

export function FinancialFlowFilter({ searchParams }: SearchParamsType) {
  const router = useRouter()

  const searchParamsObject = new URLSearchParams(searchParams)
  const params = new URLSearchParams(searchParamsObject.toString())

  const { canCreateBankAccount } = usePlanFeatures()

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
    <PermissionGate permissions={['financial:flow:edit']}>
      <>
        <DateRangePickerBasic
          label="Período"
          placeholder="Selecione o período"
          className="w-full sm:w-[220px]"
          value={defaultDateRange}
          onChange={handleDateRangeChange}
        />
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
          label="Situação"
          placeholder="Selecione uma situação"
          className="w-full sm:w-[220px]"
          options={[
            { value: 'all', label: 'Todas' },
            { value: 'PENDING', label: 'Em aberto' },
            { value: 'PAID', label: 'Pago' },
            { value: 'PROVISIONED', label: 'Provisionado' },
            { value: 'OVERDUE', label: 'Atrasado' },
            { value: 'CANCELED', label: 'Cancelado' },
          ]}
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
