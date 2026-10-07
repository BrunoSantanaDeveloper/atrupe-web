'use client'

// React
import { useRouter } from '@/hooks/useRouter'

// Components
import { SelectBasic } from '@/components/common/form/FormSelect'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import { useMemo } from 'react'
import { useSector } from '@/hooks/queries/useSector'
import { useEmployee } from '@/hooks/queries/useEmployee'

const typeOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'INCREASE', label: 'Acréscimo' },
  { value: 'DISCOUNT', label: 'Desconto' },
]

export function TableFilter({ searchParams }: SearchParamsType) {
  const router = useRouter()

  const searchParamsObject = new URLSearchParams(searchParams)
  const params = new URLSearchParams(searchParamsObject.toString())

  const { data: sectors } = useSector()
  const { data: employees } = useEmployee()

  const employeeOptions = useMemo(() => {
    return employees?.map((employee) => ({
      value: employee.id,
      label: employee.name,
    }))
  }, [employees])

  const sectorOptions = useMemo(() => {
    return sectors
      ?.filter((sector) => sector.isActive === true)
      ?.map((sector) => ({
        value: sector.id,
        label: sector.name,
      }))
  }, [sectors])

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
      <SelectBasic
        name="sectorId"
        label="Setor"
        options={[{ value: 'all', label: 'Todos' }, ...(sectorOptions ?? [])]}
        value={searchParams?.sectorId || 'all'}
        onChange={(value) => handleFilter('sectorId', value)}
        className="max-w-[220px] w-full"
      />
      <SelectBasic
        name="employeeId"
        label="Colaborador"
        options={[{ value: 'all', label: 'Todos' }, ...(employeeOptions ?? [])]}
        value={searchParams?.employeeId || 'all'}
        onChange={(value) => handleFilter('employeeId', value)}
        className="max-w-[220px] w-full"
      />
      <SelectBasic
        name="costType"
        label="Tipo de custo"
        options={typeOptions}
        value={searchParams?.costType || 'all'}
        onChange={(value) => handleFilter('costType', value)}
        className="max-w-[220px] w-full"
      />
    </>
  )
}
