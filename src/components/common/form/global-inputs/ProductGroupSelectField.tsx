import React, { useMemo } from 'react'

// UI
import { FormSelect } from '../FormSelect'

// Types
import type { Path, FieldValues } from 'react-hook-form'

// hooks
import { useProductGroup } from '@/hooks/queries/useProductGroup'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  disabled?: boolean
}

export function SelectProductGroupField<T extends FieldValues>({
  name,
  label = 'Grupo de produto',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  ...props
}: Props<T>) {
  const { data: productGroups } = useProductGroup()

  const options = useMemo(() => {
    return productGroups?.map((group) => ({
      value: group.id,
      label: group.name,
    }))
  }, [productGroups])

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
