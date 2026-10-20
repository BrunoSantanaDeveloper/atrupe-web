'use client'

// React
import { useRouter } from '@/hooks/useRouter'

// Components
import { SupplierCategorySelectField } from '@/components/common/form/global-inputs/SupplierCategorySelectField'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function SuppliersFilter({ searchParams }: SearchParamsType) {
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
      <SupplierCategorySelectField
        name="categoryId"
        label="Grupo"
        className="w-[220px]"
        value={searchParams?.categoryId || 'all'}
        onChange={(value) => handleFilter('categoryId', value)}
      />
    </>
  )
}
