'use client'

// React
import { useRouter } from 'next/navigation'

// Components
import { SelectBankField } from '@/components/common/form/global-inputs/BanksSelectField'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function CheckoutFilter({ searchParams }: SearchParamsType) {
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
    <>
      <SelectBankField
        noForm
        name="checkout"
        label="Frente de caixa"
        width="w-[220px]"
        value={searchParams?.checkoutId || 'all'}
        onChange={(value) => handleFilter('checkoutId', value)}
      />
    </>
  )
}
