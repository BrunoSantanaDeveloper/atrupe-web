import React, { useMemo } from 'react'

// UI
import { FormSelect, SelectBasic } from '../FormSelect'

// Type
import type { Path, FieldValues } from 'react-hook-form'

// Hooks
import { useSeller } from '@/hooks/queries/useSeller'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  // Filtros compactos: sem o rótulo em cima, o "todos" diz o que é
  hideLabel?: boolean
  allLabel?: string
  noForm?: boolean
  value?: string
  onChange?: (value: string) => void
}

export function SelectSellerField<T extends FieldValues>({
  name,
  label = 'Vendedor',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  value,
  onChange,
  noForm,
  hideLabel,
  allLabel = 'Todos',
  ...props
}: Props<T>) {
  const { data: sellers } = useSeller()

  const options = useMemo(() => {
    return sellers?.map((sector) => ({
      value: sector.id,
      label: sector.name,
    }))
  }, [sellers])

  if (noForm)
    return (
      <SelectBasic
        name={name}
        label={label}
        placeholder={placeholder}
        options={[{ value: 'all', label: allLabel }, ...(options || [])]}
        hideLabel={hideLabel}
        value={value}
        onChange={onChange}
        className={width}
        {...props}
      />
    )

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
