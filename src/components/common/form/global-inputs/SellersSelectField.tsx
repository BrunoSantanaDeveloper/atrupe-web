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
        options={[{ value: 'all', label: 'Todos' }, ...(options || [])]}
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
