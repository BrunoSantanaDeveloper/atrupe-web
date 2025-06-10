import React, { useMemo } from 'react'

// UI
import { FormSelect } from '../FormSelect'

// Types
import type { Path, FieldValues } from 'react-hook-form'

// hooks
import { useCompany } from '@/hooks/queries/useCompany'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  disabled?: boolean
}

export function SelectCompanyField<T extends FieldValues>({
  name,
  label = 'Empresa',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  ...props
}: Props<T>) {
  const { data: companys } = useCompany()

  const options = useMemo(() => {
    return companys?.map((company) => ({
      value: company.id,
      label: company?.general.name,
    }))
  }, [companys])

  return (
    <FormSelect<T>
      name={name}
      label={label}
      placeholder={placeholder}
      options={options ?? []}
      width={width}
      {...props}
    />
  )
}
