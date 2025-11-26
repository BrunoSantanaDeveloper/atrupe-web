'use client'

// React
import { useRouter } from 'next/navigation'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import { SortSelectorField } from '@/components/common/form/global-inputs/SortSelectField'

export function Filter({ searchParams }: SearchParamsType) {
  const router = useRouter()

  const searchParamsObject = new URLSearchParams(searchParams)
  const params = new URLSearchParams(searchParamsObject.toString())

  const handleSort = (key: string, value: string) => {
    if (!value || value === 'padrao') {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    router.push(`?${params.toString()}`)
  }

  return (
    <SortSelectorField
      name="sort"
      width="w-[220px]"
      value={searchParams?.sort || 'padrao'}
      onChange={(value) => handleSort('sort', value)}
    />
  )
}
