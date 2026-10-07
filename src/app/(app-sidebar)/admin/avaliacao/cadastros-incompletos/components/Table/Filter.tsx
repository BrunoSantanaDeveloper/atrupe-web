'use client'

// React
import { useRouter } from '@/hooks/useRouter'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import { SortSelectorField } from '@/components/common/form/global-inputs/SortSelectField'

const sortOptions = [
  { value: 'created_at', label: 'Data de criação' },
  { value: 'updated_at', label: 'Últimas alterações' },
  { value: 'name', label: 'Nome da conta' },
]

export function Filter({ searchParams }: SearchParamsType) {
  const router = useRouter()

  const searchParamsObject = new URLSearchParams(searchParams)
  const params = new URLSearchParams(searchParamsObject.toString())

  const handleSort = (key: string, value: string) => {
    if (!value || value === 'created_at') {
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
      value={searchParams?.sort || 'created_at'}
      onChange={(value) => handleSort('sort', value)}
    />
  )
}
