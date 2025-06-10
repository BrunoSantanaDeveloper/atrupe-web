import React, { useEffect, useMemo } from 'react'

// UI component Imports
import { FormSelect, SelectBasic } from '../FormSelect'

// Type Imports
import { type Path, type FieldValues, useFormContext } from 'react-hook-form'

// Hooks
import { useBankAccount } from '@/hooks/queries/useBankAccount'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  noForm?: boolean
  bankId?: string
  emptyMessage?: string
  isBankRequired?: boolean
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
}

export function SelectBankAccountField<T extends FieldValues>({
  name,
  label = 'Conta bancária',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  value,
  onChange,
  noForm,
  bankId,
  emptyMessage = 'Sem conta no banco selecionado',
  isBankRequired = true,
  disabled,
  ...props
}: Props<T>) {
  const { data: bankAccounts } = useBankAccount({
    filters: { bankId },
    isBankRequired,
  })
  const formContext = useFormContext()
  const form = noForm ? null : formContext

  const options = useMemo(() => {
    return bankAccounts?.map((account) => ({
      value: account.id,
      label: account.name,
    }))
  }, [bankAccounts])

  useEffect(() => {
    // Só executa o setValue se estiver em modo form
    if (form?.setValue) {
      // eslint-disable-next-line
      form.setValue(name, '' as any) // TODO : Tipar corretamente
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankId, form?.setValue, name])

  if (noForm)
    return (
      <SelectBasic
        name={name}
        label={label}
        placeholder={placeholder}
        options={[{ value: 'all', label: 'Todas' }, ...(options ?? [])]}
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
      emptyMessage={emptyMessage}
      disabled={disabled}
      {...props}
    />
  )
}
