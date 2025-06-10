import React, { useMemo } from 'react'

// UI
import { FormSelect } from '../FormSelect'

// Types
import type { Path, FieldValues } from 'react-hook-form'

// hooks
import { useRole } from '@/hooks/queries/useRole'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  disabled?: boolean
  sectorId: string
}

export function SelectRoleField<T extends FieldValues>({
  name,
  label = 'Cargo',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  sectorId,
  ...props
}: Props<T>) {
  const { data: roles } = useRole({ sectorId })

  const options = useMemo(() => {
    if (!sectorId) return []

    return roles?.map((role) => ({
      value: role.id,
      label: role.name,
    }))
  }, [roles, sectorId])

  return (
    <FormSelect<T>
      name={name}
      label={label}
      placeholder={placeholder}
      options={options ?? []}
      width={width}
      emptyMessage="Selecione um setor"
      {...props}
    />
  )
}
