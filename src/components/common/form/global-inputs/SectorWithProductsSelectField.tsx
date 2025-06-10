import React, { useMemo } from 'react'

// UI
import { FormSelect } from '../FormSelect'

// Types
import type { Path, FieldValues } from 'react-hook-form'

// hooks
import { useSectorWithProducts } from '@/hooks/queries/useSectorWithProducts'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  disabled?: boolean
}

export function SelectSectorWithProductsField<T extends FieldValues>({
  name,
  label = 'Setor',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  ...props
}: Props<T>) {
  const { data: sectors } = useSectorWithProducts()
  const options = useMemo(() => {
    return sectors?.map((sector) => ({
      value: sector.id,
      label: sector.name,
    }))
  }, [sectors])

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
