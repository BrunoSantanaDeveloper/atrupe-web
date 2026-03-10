import React, { useMemo } from 'react'

// UI component Imports
import { FormSelect, SelectBasic } from '../FormSelect'

// Type Imports
import { type Path, type FieldValues } from 'react-hook-form'

// Hooks
import { useAvailablePaymentConditions } from '@/hooks/queries/useAvailablePaymentConditions'

interface Props<T extends FieldValues> {
  name: Path<T>
  type?: 'receivable' | 'payable'
  label?: string
  placeholder?: string
  width?: string
  additionalOnChange?: (value: string) => void
  disabled?: boolean
  noForm?: boolean
  value?: string
}

export function AvailablePaymentConditionsSelectField<T extends FieldValues>({
  name,
  type,
  label = 'Forma de pagamento',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  additionalOnChange,
  disabled,
  noForm,
  value,
  ...props
}: Props<T>) {
  const { data: paymentConditions } = useAvailablePaymentConditions(type)

  const options = useMemo(() => {
    if (!paymentConditions) return []

    // eslint-disable-next-line
    return (paymentConditions as any[])?.map((paymentCondition) => ({
      value: paymentCondition.id,
      label: paymentCondition.name,
    }))
  }, [paymentConditions])

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
