'use client'

// React
import { useRouter } from '@/hooks/useRouter'

// Components
import { SelectClientCategoryField } from '@/components/common/form/global-inputs/ClientCategorySelectField'
import { SelectSellerField } from '@/components/common/form/global-inputs/SellersSelectField'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function ClientsFilter({ searchParams }: SearchParamsType) {
  const router = useRouter()
  const { canManageClientResponsible } = usePlanFeatures()

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
      <SelectClientCategoryField
        name="categoryId"
        label="Grupo"
        className="w-[220px]"
        value={searchParams?.categoryId || 'all'}
        onChange={(value) => handleFilter('categoryId', value)}
      />

      {canManageClientResponsible() && (
        <SelectSellerField
          noForm
          name="responsibleId"
          label="Responsável"
          placeholder="Todos Responsáveis"
          width="w-[220px]"
          value={searchParams?.responsibleId || 'all'}
          onChange={(value) => handleFilter('responsibleId', value)}
        />
      )}
    </>
  )
}
