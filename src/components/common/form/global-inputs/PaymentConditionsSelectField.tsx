import React, { useMemo } from 'react'

// UI component Imports
import { FormSelect, SelectBasic } from '../FormSelect'

// Type Imports
import { type Path, type FieldValues, useFormContext } from 'react-hook-form'

// Hooks
import { usePaymentConditions } from '@/hooks/queries/usePaymentConditions'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  noForm?: boolean
  value?: string
  additionalOnChange?: (value: string) => void
  disabled?: boolean
  // Só estas formas (as liberadas para o cliente no orçamento); nulo, todas.
  // A escolhida fica na lista mesmo fora delas, para o campo não esvaziar
  allowedIds?: string[] | null
}

export function PaymentConditionsSelectField<T extends FieldValues>({
  name,
  label = 'Forma de pagamento',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  value,
  noForm,
  additionalOnChange,
  disabled,
  allowedIds,
  ...props
}: Props<T>) {
  const { data: paymentConditions } = usePaymentConditions()

  const form = useFormContext()
  const current = noForm ? value : form?.watch(name)

  const options = useMemo(() => {
    if (!paymentConditions || paymentConditions.length === 0) return []

    return paymentConditions
      .filter(
        (paymentCondition) =>
          !allowedIds ||
          allowedIds.includes(paymentCondition.id) ||
          paymentCondition.id === current,
      )
      .map((paymentCondition) => ({
        value: paymentCondition.id,
        label: paymentCondition.name,
      }))
  }, [paymentConditions, allowedIds, current])

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
