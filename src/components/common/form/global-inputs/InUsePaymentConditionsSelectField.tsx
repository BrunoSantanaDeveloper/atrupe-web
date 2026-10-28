import React, { useMemo } from 'react'

// UI component Imports
import { FormSelect, SelectBasic } from '../FormSelect'

// Type Imports
import { type Path, type FieldValues } from 'react-hook-form'

// Hooks
import { usePaymentConditions } from '@/hooks/queries/usePaymentConditions'
import { useInUsePaymentConditions } from '@/hooks/queries/useInUsePaymentConditions'

// O que as duas listas têm em comum
type Named = { id: string; name: string; isActive?: boolean }

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

export function InUsePaymentConditionsSelectField<T extends FieldValues>({
  name,
  label = 'Forma de pagamento',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  additionalOnChange,
  disabled,
  noForm,
  value,
  ...props
}: Props<T>) {
  const { data: paymentConditions } = useInUsePaymentConditions()

  // As cadastradas e ativas, mais as inativas que já têm movimento. Só as
  // "em uso" deixavam o filtro vazio numa empresa sem lançamentos (LITE
  // part3, item 1, 28/10/2026)
  const { data: registered } = usePaymentConditions()
  const options = useMemo(() => {
    const seen = new Set<string>()
    const all = [
      ...((registered as unknown as Named[] | undefined) || []).filter(
        (item) => item.isActive !== false,
      ),
      ...((paymentConditions as unknown as Named[] | undefined) || []),
    ]
    return all
      .filter((item) => item?.id && !seen.has(item.id) && seen.add(item.id))
      .map((item) => ({
        value: item.id,
        label: item.isActive === false ? `${item.name} (inativa)` : item.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
  }, [registered, paymentConditions])

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
