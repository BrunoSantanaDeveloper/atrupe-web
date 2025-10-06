'use client'

// React
import { useRouter } from 'next/navigation'

// Components
import { FinancialFlowDatePicker } from './DatePicker'
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

  const handleFilter = (key: string, value: string) => {
    if (!value || value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    params.delete('page')

    router.push(`?${params.toString()}`)
  }

  return (
    <PermissionGate permissions={['financial:flow:edit']}>
      <>
        <FinancialFlowDatePicker searchParams={searchParams} />
        {canCreateBankAccount() && (
          <InUseBankAccountsSelectField
            noForm
            name="bankAccountId"
            placeholder="Selecione uma conta"
            value={searchParams?.bankAccountId || 'all'}
            additionalOnChange={(value) => handleFilter('bankAccountId', value)}
            width="w-[220px]"
          />
        )}
        <SelectBasic
          name="status"
          label="Situação"
          placeholder="Selecione uma situação"
          className="w-[220px]"
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
          width="w-[220px]"
        />
      </>
    </PermissionGate>
  )
}
