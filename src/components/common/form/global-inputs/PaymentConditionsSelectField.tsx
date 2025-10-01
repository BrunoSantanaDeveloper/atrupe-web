import React, { useMemo } from 'react'

// UI component Imports
import { FormSelect } from '../FormSelect'

// Type Imports
import { type Path, type FieldValues } from 'react-hook-form'

// Hooks
import { usePaymentConditions } from '@/hooks/queries/usePaymentConditions'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  onChange?: (value: string) => void
  disabled?: boolean
}

export function PaymentConditionsSelectField<T extends FieldValues>({
  name,
  label = 'Forma de pagamento',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  onChange,
  disabled,
  ...props
}: Props<T>) {
  const { data: paymentConditions } = usePaymentConditions()

  const options = useMemo(() => {
    if (!paymentConditions || paymentConditions.length === 0) return []

    return paymentConditions.map((paymentCondition) => ({
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
