import React, { useMemo } from 'react'

// UI component Imports
import { FormSelect, SelectBasic } from '../FormSelect'

// Type Imports
import type { Path, FieldValues } from 'react-hook-form'

// Hooks
import { useBankFilterMethod } from '@/hooks/queries/useBankFilterMethod'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  noForm?: boolean
  value?: string
  onChange?: (value: string) => void
  methodId?: string
  disabled?: boolean
}

export function SelectBankFilterMethodField<T extends FieldValues>({
  name,
  label = 'Banco',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  value,
  onChange,
  methodId,
  noForm,
  disabled,
  ...props
}: Props<T>) {
  const { data: banks } = useBankFilterMethod(methodId || '')

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
        disabled={disabled}
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
      disabled={disabled}
      {...props}
    />
  )
}
