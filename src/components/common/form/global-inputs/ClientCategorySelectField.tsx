import React, { useMemo } from 'react'

// UI component Imports
import { SelectBasic } from '../FormSelect'

// Type Imports
import type { Path, FieldValues } from 'react-hook-form'

// Hooks
import { useCategoryOptions } from '@/hooks/queries/useCategoryOptions'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  className?: string
  value?: string
  onChange?: (value: string) => void
}

export function SelectClientCategoryField<T extends FieldValues>({
  name,
  label = 'Categoria de cliente',
  placeholder = label,
  className = 'flex-[1_0_100px]',
  ...props
}: Props<T>) {
  const { data: clientCategories, isLoading } = useCategoryOptions('CLIENT')

  const options = useMemo(() => {
    if (isLoading) return []
    return [{ value: 'all', label: 'Todas' }, ...clientCategories]
  }, [clientCategories, isLoading])

  return (
    <SelectBasic
      name={name}
      label={label}
      placeholder={placeholder}
      options={options}
      className={className}
      {...props}
    />
  )
}
