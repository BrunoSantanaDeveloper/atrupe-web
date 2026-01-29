import React, { useMemo } from 'react'

// UI component Imports
import { FormSelect, SelectBasic } from '../FormSelect'

// Type Imports
import type { Path, FieldValues } from 'react-hook-form'

// Hooks
import { usePaymentMethod } from '@/hooks/queries/usePaymentMethods'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  noForm?: boolean
  value?: string
  disabled?: boolean
  additionalOnChange?: (value: string, label: string) => void
}

export function SelectPaymentMethodField<T extends FieldValues>({
  name,
  label = 'Forma de pagamento',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  value,
  noForm,
  disabled,
  additionalOnChange,
  ...props
}: Props<T>) {
  const { data: paymentMethods } = usePaymentMethod()

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
        onChange={(val) => additionalOnChange?.(val, '')}
        className={width}
        disabled={disabled}
        {...props}
      />
    )

  const handleChange = (value: string) => {
    const selectedOption = options?.find((opt) => opt.value === value)
    additionalOnChange?.(value, selectedOption?.label ?? '')
  }

  return (
    <FormSelect<T>
      name={name}
      label={label}
      placeholder={placeholder}
      options={options ?? []}
      width={width}
      additionalOnChange={handleChange}
      disabled={disabled}
      {...props}
    />
  )
}
