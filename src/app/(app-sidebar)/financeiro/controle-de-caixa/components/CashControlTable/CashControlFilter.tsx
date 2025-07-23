'use client'

// React
import { useRouter } from 'next/navigation'

// Components
import { SelectBankAccountField } from '@/components/common/form/global-inputs/BankAccountSelectField'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import { SortSelectorField } from '@/components/common/form/global-inputs/SortSelectField'

export function CashControlFilter({ searchParams }: SearchParamsType) {
  const router = useRouter()

  const searchParamsObject = new URLSearchParams(searchParams)
  const params = new URLSearchParams(searchParamsObject.toString())

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
    <>
      <SelectBankAccountField
        noForm
        name="bankAccountName"
        label="Conta"
        width="w-[220px]"
        value={searchParams?.bankAccountName || 'all'}
        onChange={(value) => handleFilter('bankAccountName', value)}
      />
      <SortSelectorField
        name="sort"
        width="w-[220px]"
        value={searchParams?.sort || 'padrao'}
        onChange={(value) => handleFilter('sort', value)}
      />
    </>
  )
}
