import React, { useMemo } from 'react'

// UI
import { FormSelect } from '../FormSelect'

// Types
import type { Path, FieldValues } from 'react-hook-form'

// hooks
import { useProductGroupWithSector } from '@/hooks/queries/useProductGroup'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  disabled?: boolean
  selectedSectorId?: string
}

export function SelectProductGroupWithSectorField<T extends FieldValues>({
  name,
  label = 'Grupo de produto',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  selectedSectorId,
  ...props
}: Props<T>) {
  const { data: productGroups } = useProductGroupWithSector()

  const options = useMemo(() => {
    return (
      productGroups
        ?.find((group) => group?.sectorId === selectedSectorId)
        ?.groups.map((group) => ({
          value: group.id,
          label: group.name,
        })) ?? []
    )
  }, [productGroups, selectedSectorId])

  return (
    <FormSelect<T>
      name={name}
      label={label}
      placeholder={placeholder}
      options={options ?? []}
      width={width}
      disabled={!selectedSectorId}
      emptyMessage="Não há grupos de produtos para o setor selecionado"
      {...props}
    />
  )
}
