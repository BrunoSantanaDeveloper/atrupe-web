import React, { useMemo } from 'react'

// UI component Imports
import { FormSelect } from '../FormSelect'

// Type Imports
import type { Path, FieldValues } from 'react-hook-form'

// Hooks
import { useAddressCities } from '@/hooks/queries/useAddressCities'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  stateId: string
}

export function SelectCityField<T extends FieldValues>({
  name,
  label = 'Cidade',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  stateId,
  ...props
}: Props<T>) {
  const { data: cities } = useAddressCities(stateId)

  const options = useMemo(() => {
    return cities?.map((sector) => ({
      value: sector.id,
      label: sector.name,
    }))
  }, [cities])

  return (
    <FormSelect<T>
      name={name}
      label={label}
      placeholder={placeholder}
      options={options ?? []}
      width={width}
      emptyMessage="Selecione um estado"
      {...props}
    />
  )
}
