'use client'

// React
import { useRouter } from 'next/navigation'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import { SortSelectorField } from '@/components/common/form/global-inputs/SortSelectField'

// UI
import { SelectBasic } from '@/components/common/form/FormSelect'

const sortOptions = [
  { value: 'default', label: 'Nome da conta' },
  { value: 'updated_at', label: 'Últimas alterações' },
  { value: 'created_at', label: 'Data de criação' },
]

const filterOptions = [{ value: 'default', label: 'Nenhum' }]

const stateOptions = [{ value: 'default', label: 'Todos' }]

export function Filter({ searchParams }: SearchParamsType) {
  const router = useRouter()

  const searchParamsObject = new URLSearchParams(searchParams)
  const params = new URLSearchParams(searchParamsObject.toString())

  const handleFilter = (key: string, value: string) => {
    if (!value || value === 'default') {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    params.delete('page')

    router.push(`?${params.toString()}`)
  }

  return (
    <>
      <SortSelectorField
        name="sort"
        width="w-[220px]"
        options={sortOptions}
        value={searchParams?.sort || 'default'}
        onChange={(value) => handleFilter('sort', value)}
      />

      <SelectBasic
        name="filter"
        label="Filtrar por"
        value={searchParams?.filter || 'default'}
        onChange={(value) => handleFilter('filter', value)}
        options={filterOptions}
        className="w-[220px]"
      />

      <SelectBasic // Usar select de Estado
        name="state"
        label="Estado"
        value={searchParams?.state || 'default'}
        onChange={(value) => handleFilter('state', value)}
        options={stateOptions}
        className="w-[220px]"
      />
    </>
  )
}
