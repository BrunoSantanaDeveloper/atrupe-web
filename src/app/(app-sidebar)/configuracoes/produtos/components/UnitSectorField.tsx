'use client'

// O setor da etapa de cobrança (área 9 §4.16): em que setor esta unidade de
// venda é feita. Vira um ícone fixo do fluxo de produção.

import { useMemo } from 'react'
import { FormSelect } from '@/components/common/form/FormSelect'
import { useSector } from '@/hooks/queries/useSector'
import { NO_SECTOR } from './unitSectors'
import type { NewProductsFormType } from './schema'

export function UnitSectorField({ index }: { index: number }) {
  const { data: sectors } = useSector({ isProductionStage: true })
  const options = useMemo(
    () => [
      ...(sectors ?? [])
        .filter((sector) => sector.isActive)
        .map((sector) => ({ value: sector.id, label: sector.name })),
      { value: NO_SECTOR, label: 'Não passa por setor' },
    ],
    [sectors],
  )
  return (
    <FormSelect<NewProductsFormType>
      name={`items.${index}.sectorId`}
      label="Setor da produção"
      placeholder="Em que setor é feita"
      options={options}
      width="flex-[1_0_200px]"
    />
  )
}
