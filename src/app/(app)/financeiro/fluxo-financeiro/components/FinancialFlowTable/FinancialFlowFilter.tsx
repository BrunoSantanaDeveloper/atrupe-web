'use client'

// React
// import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Components
// import { FormDatePickerSingle } from '@/components/common/form/FormDatePicker'
import { SelectPaymentMethodField } from '@/components/common/form/global-inputs/PaymentMethodsSelectField'
import { PermissionGate } from '@/components/common/PermissionGate'

// Third-party
// import { format } from 'date-fns'
// import { ptBR } from 'date-fns/locale'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import { SelectBasic } from '@/components/common/form/FormSelect'

export function FinancialFlowFilter({ searchParams }: SearchParamsType) {
  // const [date, setDate] = useState<Date>()

  const router = useRouter()

  const searchParamsObject = new URLSearchParams(searchParams)
  const params = new URLSearchParams(searchParamsObject.toString())

  const handleFilter = (key: string, value: string) => {
    if (!value || value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    router.push(`?${params.toString()}`)
  }

  return (
    <PermissionGate permissions={['financial:flow:edit']}>
      <>
        {/* <FormDatePickerSingle
          name="date"
          label="Período"
          placeholder="Selecione um período"
          width="w-[220px]"
          value={date}
          onSelect={(value) => {
            if (value) {
              setDate(value)
              handleFilter('date', format(value, 'P', { locale: ptBR }))
            } else {
              setDate(undefined)
              handleFilter('date', '')
            }
          }}
        /> */}
        <SelectBasic
          name="bankAccountId"
          label="Conta"
          placeholder="Selecione uma conta"
          className="w-[220px]"
          options={[{ value: 'all', label: 'Todas' }]}
          value={searchParams?.bankAccountId || 'all'}
          onChange={(value) => handleFilter('bankAccountId', value)}
        />
        <SelectBasic
          name="status"
          label="Situação"
          placeholder="Selecione uma situação"
          className="w-[220px]"
          options={[{ value: 'all', label: 'Todas' }]}
          value={searchParams?.status || 'all'}
          onChange={(value) => handleFilter('status', value)}
        />
        <SelectPaymentMethodField
          noForm
          name="paymentMethodId"
          label="Forma de pagamento"
          placeholder="Selecione uma forma de pagamento"
          width="w-[220px]"
          value={searchParams?.paymentMethodId || 'all'}
          additionalOnChange={(value) => handleFilter('paymentMethodId', value)}
        />
      </>
    </PermissionGate>
  )
}
