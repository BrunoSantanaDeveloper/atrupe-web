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
import { useSector } from '@/hooks/queries/useSector'
import { useProductGroupWithSector } from '@/hooks/queries/useProductGroup'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Setor e grupo filtram a lista (decisão do produto, 26/10/2026): com
// dezenas de produtos, só a busca por texto não bastava. O grupo segue o
// setor escolhido. O filtro de composição (CP-17) é do PRO.
export function ProductsFilter({ searchParams }: SearchParamsType) {
  const router = useRouter()
  const params = useSearchParams()
  const { data: sectors } = useSector({ isProductionStage: true })
  const { data: groupsBySector } = useProductGroupWithSector()

  if (!searchParams) return null

  const sectorId = searchParams?.sectorId || 'all'
  const sectorOptions = (sectors || []).map((sector) => ({
    value: sector.id,
    label: sector.name,
  }))
  const groupOptions = (groupsBySector || [])
    .filter((entry) => sectorId === 'all' || entry.sectorId === sectorId)
    .flatMap((entry) =>
      (entry.groups || []).map((group) => ({
        value: group.id,
        label:
          sectorId === 'all' ? `${group.name} · ${entry.sector}` : group.name,
      })),
    )

  const set = (key: string, value: string) =>
    updateFilterParam(key, value, { router, params })

  return (
    <>
      <SelectBasic
        name="setor"
        label="Setor"
        className="w-full sm:w-[220px]"
        options={[{ value: 'all', label: 'Todos' }, ...sectorOptions]}
        value={sectorId}
        onChange={(value) => {
          // Trocar o setor limpa o grupo, que é por setor
          if (searchParams?.categoryId) set('categoryId', 'all')
          set('sectorId', String(value))
        }}
      />
      <SelectBasic
        name="grupo"
        label="Grupo"
        className="w-full sm:w-[220px]"
        options={[{ value: 'all', label: 'Todos' }, ...groupOptions]}
        value={searchParams?.categoryId || 'all'}
        onChange={(value) => set('categoryId', String(value))}
      />
      {/* LITE part3, item 4 (28/10/2026): a ordem de cadastro por padrão e
          as variações sob o produto só quando pedidas */}
      <SelectBasic
        name="ordem"
        label="Ordem"
        className="w-full sm:w-[200px]"
        options={[
          { value: 'all', label: 'Ordem de cadastro' },
          { value: 'nome', label: 'Nome (A–Z)' },
        ]}
        value={searchParams?.ordem || 'all'}
        onChange={(value) => set('ordem', String(value))}
      />
      {/* Variações são do LITE em diante (PV-6, revista em 27/10/2026): no
          START o filtro não aparece (decisão de 17/11/2026, D1) */}
      <FeatureGate features={[FEATURES.PRODUCTS.PRODUCT_COMPOSITION]}>
        <SelectBasic
          name="variacoes"
          label="Variações"
          className="w-full sm:w-[220px]"
          options={[
            { value: 'all', label: 'Só os produtos' },
            { value: 'mostrar', label: 'Mostrar as variações' },
          ]}
          value={searchParams?.variacoes || 'all'}
          onChange={(value) => set('variacoes', String(value))}
        />
      </FeatureGate>
      <FeatureGate features={[FEATURES.COSTS.COST_BASE]}>
        <SelectBasic
          name="composicao"
          label="Composição"
          className="w-full sm:w-[220px]"
          options={[
            { value: 'all', label: 'Todos' },
            { value: 'com', label: 'Com composição' },
            { value: 'sem', label: 'Sem composição' },
          ]}
          value={searchParams?.composicao || 'all'}
          onChange={(value) => set('composicao', String(value))}
        />
      </FeatureGate>
    </>
  )
}
