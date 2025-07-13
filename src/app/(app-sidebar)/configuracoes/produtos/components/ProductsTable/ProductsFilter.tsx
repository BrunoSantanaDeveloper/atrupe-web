'use client'

// Next
// import { useRouter } from 'next/navigation'

// Components
import { SelectSectorField } from '@/components/common/form/global-inputs/SectorSelectField'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function ProductsFilter({ searchParams }: SearchParamsType) {
  if (!searchParams) return

  // const router = useRouter()

  // const searchParamsObject = new URLSearchParams(searchParams)
  // const params = new URLSearchParams(searchParamsObject.toString())

  // const handleFilter = (key: string, value: string) => {
  //   if (!value || value === 'all') {
  //     params.delete(key)
  //   } else {
  //     params.set(key, value)
  //   }

  //   router.push(`?${params.toString()}`)
  // }
  return

  return (
    <>
      <SelectSectorField
        name="sectorId"
        label="Setor"
        width="w-[220px]"
        // value={searchParams?.sectorId || 'all'}
        // onChange={(value) => handleFilter('sectorId', value)}
      />
      <SelectSectorField
        name="categoryId"
        label="Grupo de produtos"
        width="w-[220px]"
        // value={searchParams?.categoryId || 'all'}
        // onChange={(value) => handleFilter('categoryId', value)}
      />
      <SelectSectorField
        name="unitKind"
        label="Unidade de medida"
        width="w-[220px]"
        // value={searchParams?.unitKind || 'all'}
        // onChange={(value) => handleFilter('unitKind', value)}
      />
    </>
  )
}
