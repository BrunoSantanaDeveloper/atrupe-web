'use client'

// React / Next
import { useRouter } from 'next/navigation'

// Components
import { SelectBasic } from '@/components/common/form/FormSelect'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { AdminExpenseGroup } from '../../types'

// Hooks / Store / Consts
import { costCriterionOptions } from '@/consts/cost-base'

interface Props extends SearchParamsType {
  groups: AdminExpenseGroup[]
}

export function AdminExpensesFilter({ searchParams, groups }: Props) {
  const router = useRouter()

  const params = new URLSearchParams(
    new URLSearchParams(searchParams).toString(),
  )

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
        name="groupId"
        label="Grupo"
        className="w-full sm:w-[220px]"
        value={searchParams?.groupId || 'all'}
        onChange={(value) => handleFilter('groupId', value)}
        options={[
          { value: 'all', label: 'Todos' },
          ...groups.map((group) => ({ value: group.id, label: group.name })),
        ]}
      />
      <SelectBasic
        name="criterion"
        label="Critério"
        className="w-full sm:w-[220px]"
        value={searchParams?.criterion || 'all'}
        onChange={(value) => handleFilter('criterion', value)}
        options={[{ value: 'all', label: 'Todos' }, ...costCriterionOptions]}
      />
    </>
  )
}
