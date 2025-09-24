'use client'

// React
import { useRouter } from 'next/navigation'

// Components
import { FinancialFlowDatePicker } from './DatePicker'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { SelectBasic } from '@/components/common/form/FormSelect'
import { PermissionGate } from '@/components/common/PermissionGate'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { getData } from '@/actions/_cruds'

export function FinancialFlowFilter({ searchParams }: SearchParamsType) {
  const router = useRouter()

  const searchParamsObject = new URLSearchParams(searchParams)
  const params = new URLSearchParams(searchParamsObject.toString())

  const { canCreateBankAccount } = usePlanFeatures()

  const { data: paymentMethodsData } = useQuery({
    queryKey: ['payment-methods-in-use'],
    queryFn: () => getData({ route: '/financial/flow/payment-methods/in-use' }),
  })

  const { data: bankAccountsData } = useQuery({
    queryKey: ['bank-accounts-in-use'],
    queryFn: () => getData({ route: '/financial/flow/bank-accounts/in-use' }),
  })

  const paymentMethodOptions =
    paymentMethodsData?.data?.map((method: { id: string; name: string }) => ({
      value: method.id,
      label: method.name,
    })) || []

  const bankAccountOptions =
    bankAccountsData?.data?.map((account: { id: string; name: string }) => ({
      value: account.id,
      label: account.name,
    })) || []

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
          <SelectBasic
            name="bankAccountId"
            label="Conta"
            placeholder="Selecione uma conta"
            className="w-[220px]"
            options={[{ value: 'all', label: 'Todas' }, ...bankAccountOptions]}
            value={searchParams?.bankAccountId || 'all'}
            onChange={(value) => handleFilter('bankAccountId', value)}
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
        <SelectBasic
          name="paymentMethodId"
          label="Forma de pagamento"
          placeholder="Selecione uma forma de pagamento"
          options={[{ value: 'all', label: 'Todas' }, ...paymentMethodOptions]}
          value={searchParams?.paymentMethodId || 'all'}
          onChange={(value) => handleFilter('paymentMethodId', value)}
          className="w-[220px]"
        />
      </>
    </PermissionGate>
  )
}
