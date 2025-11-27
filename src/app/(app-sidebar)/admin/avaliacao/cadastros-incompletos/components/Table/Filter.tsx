'use client'

// React
import { useRouter } from 'next/navigation'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import { SortSelectorField } from '@/components/common/form/global-inputs/SortSelectField'

const sortOptions = [
  { value: 'default', label: 'Nome da conta' },
  { value: 'updated_at', label: 'Últimas alterações' },
  { value: 'created_at', label: 'Data de criação' },
]

export function Filter({ searchParams }: SearchParamsType) {
  const router = useRouter()

  const searchParamsObject = new URLSearchParams(searchParams)
  const params = new URLSearchParams(searchParamsObject.toString())

  const handleSort = (key: string, value: string) => {
    if (!value || value === 'default') {
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
      options={sortOptions}
      value={searchParams?.sort || 'default'}
      onChange={(value) => handleSort('sort', value)}
    />
  )
}
