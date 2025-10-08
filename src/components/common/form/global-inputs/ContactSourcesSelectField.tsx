import React, { useMemo } from 'react'

// UI component Imports
import { FormSelect, SelectBasic } from '../FormSelect'

// Type Imports
import type { Path, FieldValues } from 'react-hook-form'

// Hooks
import { useContactSources } from '@/hooks/queries/useContactSources'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  noForm?: boolean
  value?: string
  disabled?: boolean
  additionalOnChange?: (value: string) => void
}

export function SelectContactSourceField<T extends FieldValues>({
  name,
  label = 'Atendimento',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  value,
  noForm,
  disabled,
  additionalOnChange,
  ...props
}: Props<T>) {
  const { data: contactSources } = useContactSources()

  const options = useMemo(() => {
    return contactSources?.map((contactSource) => ({
      value: contactSource.id,
      label: contactSource.name,
    }))
  }, [contactSources])

  if (noForm)
    return (
      <SelectBasic
        name={name}
        label={label}
        placeholder={placeholder}
        options={options || []}
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
