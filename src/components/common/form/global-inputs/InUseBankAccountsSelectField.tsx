import React, { useMemo } from 'react'

// UI component Imports
import { FormSelect, SelectBasic } from '../FormSelect'

// Type Imports
import { type Path, type FieldValues } from 'react-hook-form'

// Hooks
import { useInUseBankAccounts } from '@/hooks/queries/useInUseBankAccounts'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  additionalOnChange?: (value: string) => void
  disabled?: boolean
  noForm?: boolean
  value?: string
}

export function InUseBankAccountsSelectField<T extends FieldValues>({
  name,
  label = 'Conta',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  additionalOnChange,
  disabled,
  noForm,
  value,
  ...props
}: Props<T>) {
  const { data: bankAccounts } = useInUseBankAccounts()

  const options = useMemo(() => {
    if (!bankAccounts) return []

    // eslint-disable-next-line
    return (bankAccounts as any[])?.map((bankAccount) => ({
      value: bankAccount.id,
      label: bankAccount.name,
    }))
  }, [bankAccounts])

  if (noForm)
    return (
      <SelectBasic
        name={name}
        label={label}
        placeholder={placeholder}
        options={[{ value: 'all', label: 'Todas' }, ...(options || [])]}
        value={value}
        onChange={additionalOnChange}
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
      additionalOnChange={additionalOnChange}
      disabled={disabled}
      {...props}
    />
  )
}
