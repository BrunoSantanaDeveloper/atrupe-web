import React, { useMemo } from 'react'

// UI component Imports
import { FormSelect } from '../FormSelect'

// Type Imports
import type { Path, FieldValues } from 'react-hook-form'

// Hooks
import { useAddressStates } from '@/hooks/queries/useAddressStates'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
}

export function SelectStateField<T extends FieldValues>({
  name,
  label = 'Estado',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  ...props
}: Props<T>) {
  const { data: states } = useAddressStates()

  const options = useMemo(() => {
    return states?.map((sector) => ({
      value: sector.id,
      label: sector.name,
    }))
  }, [states])

  return (
    <FormSelect<T>
      name={name}
      label={label}
      placeholder={placeholder}
      options={options ?? []}
      width={width}
      {...props}
    />
  )
}
