'use client'

// React
import { useRouter } from '@/hooks/useRouter'

// Components
import { SelectSerieField } from '@/components/common/form/global-inputs/SeriesSelectField'
import { SelectSellerField } from '@/components/common/form/global-inputs/SellersSelectField'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function DeliveryScheduleFilter({ searchParams }: SearchParamsType) {
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
      <SelectSerieField
        noForm
        name="serie"
        label="Série"
        width="w-[220px]"
        value={searchParams?.serieId || 'all'}
        onChange={(value) => handleFilter('serieId', value)}
      />
      <SelectSellerField
        noForm
        name="seller"
        label="Vendedor"
        width="w-[220px]"
        value={searchParams?.sellerId || 'all'}
        onChange={(value) => handleFilter('sellerId', value)}
      />
    </>
  )
}
