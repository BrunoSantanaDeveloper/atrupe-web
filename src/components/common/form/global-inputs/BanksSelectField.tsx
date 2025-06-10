import React, { useMemo } from 'react'

// UI component Imports
import { FormSelect, SelectBasic } from '../FormSelect'

// Type Imports
import type { Path, FieldValues } from 'react-hook-form'

// Hooks
import { useBank } from '@/hooks/queries/useBank'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  noForm?: boolean
  value?: string
  onChange?: (value: string) => void
}

export function SelectBankField<T extends FieldValues>({
  name,
  label = 'Banco',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  value,
  onChange,
  noForm,
  ...props
}: Props<T>) {
  const { data: banks } = useBank()

  const options = useMemo(() => {
    return banks?.map((bank) => ({
      value: bank.id,
      label: bank.code + ' - ' + bank.name,
    }))
  }, [banks])

  if (noForm)
    return (
      <SelectBasic
        name={name}
        label={label}
        placeholder={placeholder}
        options={options ?? []}
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
