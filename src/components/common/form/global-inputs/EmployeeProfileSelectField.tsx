import React, { useMemo } from 'react'

// UI
import { FormSelect, SelectBasic } from '../FormSelect'

// Type
import type { Path, FieldValues } from 'react-hook-form'

// Hooks
import { useEmployee } from '@/hooks/queries/useEmployee'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  noForm?: boolean
  value?: string
  onChange?: (value: string) => void
}

export function SelectEmployeeProfileField<T extends FieldValues>({
  name,
  label = 'Colaborador',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  value,
  onChange,
  noForm,
  ...props
}: Props<T>) {
  const { data: employees } = useEmployee()

  const options = useMemo(() => {
    return employees?.map((employee) => ({
      value: employee.id,
      label: employee.name,
    }))
  }, [employees])

  if (noForm)
    return (
      <SelectBasic
        name={name}
        label={label}
        placeholder={placeholder}
        options={[{ value: 'all', label: 'Todos' }, ...(options || [])]}
        value={value}
        onChange={onChange}
        className={width}
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
      {...props}
    />
  )
}
