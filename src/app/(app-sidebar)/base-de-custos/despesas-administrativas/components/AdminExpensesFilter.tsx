'use client'

// React / Next
import { useRouter } from '@/hooks/useRouter'

// Components
import { SelectBasic } from '@/components/common/form/FormSelect'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Hooks / Store / Consts
import { costCriterionOptions } from '@/consts/cost-base'

export function AdminExpensesFilter({ searchParams }: SearchParamsType) {
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
