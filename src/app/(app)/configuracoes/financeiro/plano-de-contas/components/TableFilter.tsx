'use client'

// React
import { useRouter } from 'next/navigation'

// Components
import { SelectBasic } from '@/components/common/form/FormSelect'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

const level1Options = [
  { value: 'all', label: 'Todos' },
  { value: '01', label: '01 - Receitas' },
  { value: '02', label: '02 - Despesas' },
]

const level2Options = [
  { value: 'all', label: 'Todos' },
  { value: '01', label: '01 - Administrativo' },
  { value: '02', label: '02 - Operacional' },
  { value: '03', label: '03 - Não operacional' },
]

export function TableFilter({ searchParams }: SearchParamsType) {
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
      <SelectBasic
        name="level1"
        label="Nível 1"
        options={level1Options}
        value={searchParams?.level1 || 'all'}
        onChange={(value) => handleFilter('level1', value)}
        className="max-w-[220px] w-full"
      />
      <SelectBasic
        name="level2"
        label="Nível 2"
        options={level2Options}
        value={searchParams?.level2 || 'all'}
        onChange={(value) => handleFilter('level2', value)}
        className="max-w-[220px] w-full"
      />
    </>
  )
}
