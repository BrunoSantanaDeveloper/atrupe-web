import React, { useMemo } from 'react'

// UI component Imports
import { FormSelect } from '../FormSelect'

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
  onChange?: (value: string) => void
  disabled?: boolean
}

export function AvailablePaymentConditionsSelectField<T extends FieldValues>({
  name,
  type,
  label = 'Forma de pagamento',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  onChange,
  disabled,
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

  return (
    <FormSelect<T>
      name={name}
      label={label}
      placeholder={placeholder}
      options={options ?? []}
      width={width}
      additionalOnChange={onChange}
      disabled={disabled}
      {...props}
    />
  )
}
