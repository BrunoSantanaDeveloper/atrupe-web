'use client'

// React
import { useRouter } from '@/hooks/useRouter'

// React
import { useMemo } from 'react'

// Components
import { SelectBasic } from '@/components/common/form/FormSelect'
import { SelectSerieField } from '@/components/common/form/global-inputs/SeriesSelectField'
import { SelectSellerField } from '@/components/common/form/global-inputs/SellersSelectField'

// Hooks
import { useSector } from '@/hooks/queries/useSector'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function DeliveryScheduleFilter({ searchParams }: SearchParamsType) {
  const router = useRouter()
  // A fila de um setor na própria agenda (GP-46, 29/10/2026): quem tem
  // vários setores vê só as entregas com etapa aberta naquele setor, sem
  // tela nova. Os setores administrativos não têm etapa
  const { data: sectors } = useSector()
  const sectorOptions = useMemo(
    () => [
      { value: 'all', label: 'Todos os setores' },
      ...(sectors || [])
        .filter((sector) => sector.isActive && sector.kind !== 'ADMINISTRATIVE')
        .map((sector) => ({ value: sector.id, label: sector.name })),
    ],
    [sectors],
  )

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
      <SelectSerieField
        noForm
        name="serie"
        label="Série"
        width="w-[220px]"
        value={searchParams?.serieId || 'all'}
        onChange={(value) => handleFilter('serieId', value)}
      />
      <SelectSellerField
        noForm
        name="seller"
        label="Vendedor"
        width="w-[220px]"
        value={searchParams?.sellerId || 'all'}
        onChange={(value) => handleFilter('sellerId', value)}
      />
      <SelectBasic
        name="stage"
        label="Setor"
        className="w-[220px]"
        options={sectorOptions}
        value={searchParams?.stageId || 'all'}
        onChange={(value) => handleFilter('stageId', String(value ?? 'all'))}
      />
    </>
  )
}
