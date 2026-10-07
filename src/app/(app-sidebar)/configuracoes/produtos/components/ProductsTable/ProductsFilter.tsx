'use client'

// Next
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/hooks/useRouter'

// Components
import { SelectBasic } from '@/components/common/form/FormSelect'
import { FeatureGate } from '@/components/common/FeatureGate'

// Hooks / Store / Consts
import { FEATURES } from '@/consts/features'
import { updateFilterParam } from '@/lib/filter-utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// O filtro de composição (CP-17): no PRO, a composição é um recurso do
// produto, e a lista precisa dizer quais já têm — não um segundo cadastro.
// Os filtros de setor, grupo e unidade seguem desligados, como estavam
export function ProductsFilter({ searchParams }: SearchParamsType) {
  const router = useRouter()
  const params = useSearchParams()

  if (!searchParams) return null

  return (
    <FeatureGate features={[FEATURES.COSTS.COST_BASE]}>
      <SelectBasic
        name="composicao"
        label="Composição"
        className="w-[220px]"
        options={[
          { value: 'all', label: 'Todos' },
          { value: 'com', label: 'Com composição' },
          { value: 'sem', label: 'Sem composição' },
        ]}
        value={searchParams?.composicao || 'all'}
        onChange={(value) =>
          updateFilterParam('composicao', String(value), { router, params })
        }
      />
    </FeatureGate>
  )
}
