'use client'

// Filtros de Materiais (20/11/2026): setor, tipo e uso, com a busca do
// cabeçalho. No PRO os papéis vivem aqui (o menu Papéis é do LITE): o tipo
// "Papéis" é o filtro deles.

// Next
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/hooks/useRouter'

// Components
import { SelectBasic } from '@/components/common/form/FormSelect'

// Hooks / Lib
import { useSector } from '@/hooks/queries/useSector'
import { updateFilterParam } from '@/lib/filter-utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { Material } from '../types'

export type MaterialKind = 'papel' | 'chapa' | 'perfil' | 'outros'

// O tipo sai da forma da configuração avançada (MT-10.1): o papel é a forma
// folha com o formato da folha (A4, SRA3…); a chapa e a bobina, a folha sem
// ele
export const materialKindOf = (material: Material): MaterialKind => {
  if (material.sheetFormat) return 'papel'
  if (material.advanced?.shape === 'SHEET') return 'chapa'
  if (material.advanced?.shape === 'PROFILE') return 'perfil'
  return 'outros'
}

export const filterMaterials = (
  materials: Material[],
  searchParams?: { [key: string]: string | undefined },
) => {
  const kind = searchParams?.tipo
  const use = searchParams?.uso
  return materials.filter(
    (material) =>
      // A API já separa a forma folha (`?paper=true`); a chapa também é
      // folha, então o papel é a folha com formato (A4, SRA3…)
      (!kind || materialKindOf(material) === kind) &&
      (!use ||
        (use === 'producao' && material.productionMaterial) ||
        (use === 'venda' && material.directSale)),
  )
}

export function MaterialsFilter({ searchParams }: SearchParamsType) {
  const router = useRouter()
  const params = useSearchParams()
  const { data: sectors } = useSector()

  if (!searchParams) return null

  const set = (key: string, value: string) =>
    updateFilterParam(key, value, { router, params })

  return (
    <>
      <SelectBasic
        name="setor"
        label="Setor"
        className="w-full sm:w-[220px]"
        options={[
          { value: 'all', label: 'Todos' },
          ...(sectors || []).map((sector) => ({
            value: sector.id,
            label: sector.name,
          })),
        ]}
        value={searchParams?.sectorId || 'all'}
        onChange={(value) => set('sectorId', String(value))}
      />
      <SelectBasic
        name="tipo"
        label="Tipo"
        className="w-full sm:w-[220px]"
        options={[
          { value: 'all', label: 'Todos' },
          { value: 'papel', label: 'Papéis' },
          { value: 'chapa', label: 'Chapas e bobinas' },
          { value: 'perfil', label: 'Perfis e barras' },
          { value: 'outros', label: 'Outros' },
        ]}
        value={searchParams?.tipo || 'all'}
        onChange={(value) => set('tipo', String(value))}
      />
      <SelectBasic
        name="uso"
        label="Uso"
        className="w-full sm:w-[200px]"
        options={[
          { value: 'all', label: 'Todos' },
          { value: 'producao', label: 'Produção' },
          { value: 'venda', label: 'Venda direta' },
        ]}
        value={searchParams?.uso || 'all'}
        onChange={(value) => set('uso', String(value))}
      />
    </>
  )
}
