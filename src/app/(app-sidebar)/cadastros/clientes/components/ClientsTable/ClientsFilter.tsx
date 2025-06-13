'use client'

// React
import { useRouter } from 'next/navigation'

// Components
import { SelectClientCategoryField } from '@/components/common/form/global-inputs/ClientCategorySelectField'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function ClientsFilter({ searchParams }: SearchParamsType) {
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
      <SelectClientCategoryField
        name="categoryId"
        label="Categoria"
        className="w-[220px]"
        value={searchParams?.categoryId || 'all'}
        onChange={(value) => handleFilter('categoryId', value)}
      />
    </>
  )
}
