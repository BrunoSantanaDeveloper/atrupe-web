import React, { useMemo } from 'react'

// UI component Imports
import { FormSelect, SelectBasic } from '../FormSelect'

// Type Imports
import type { Path, FieldValues } from 'react-hook-form'

// Hooks
import { useAvailablePaymentMethods } from '@/hooks/queries/useAvailablePaymentMethods'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  noForm?: boolean
  value?: string
  disabled?: boolean
  type?: string
  additionalOnChange?: (value: string) => void
}

export function SelectAvailablePaymentMethodField<T extends FieldValues>({
  name,
  label = 'Forma de pagamento',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  value,
  noForm,
  disabled,
  type,
  additionalOnChange,
  ...props
}: Props<T>) {
  const { data: paymentMethods } = useAvailablePaymentMethods(type)

  const options = useMemo(() => {
    return paymentMethods?.map((paymentMethod) => ({
      value: paymentMethod.id,
      label: paymentMethod.name,
    }))
  }, [paymentMethods])

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
