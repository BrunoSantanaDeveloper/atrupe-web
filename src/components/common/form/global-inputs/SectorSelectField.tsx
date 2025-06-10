import React, { useMemo } from 'react'

// UI
import { FormSelect } from '../FormSelect'

// Types
import type { Path, FieldValues } from 'react-hook-form'

// hooks
import { useSector } from '@/hooks/queries/useSector'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  disabled?: boolean
}

export function SelectSectorField<T extends FieldValues>({
  name,
  label = 'Setor',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  ...props
}: Props<T>) {
  const { data: sectors } = useSector()
  const options = useMemo(() => {
    return sectors
      ?.filter((sector) => sector.isActive === true)
      ?.map((sector) => ({
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
