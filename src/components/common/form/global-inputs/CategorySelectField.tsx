import React, { useMemo } from 'react'

// UI component Imports
import { FormSelect } from '../FormSelect'

// Type Imports
import type { Path, FieldValues } from 'react-hook-form'

// hooks
import { useCategoryBySector } from '@/hooks/queries/useCategory'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  sectorId?: string
}

export function CategorySelectField<T extends FieldValues>({
  name,
  label = 'Categoria',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  sectorId,
  ...props
}: Props<T>) {
  const { data: categories } = useCategoryBySector({ sectorId })

  const options = useMemo(() => {
    return categories
      ?.map((c) =>
        c?.groups?.map((category) => ({
          value: category.id,
          label: category.name,
        })),
      )
      ?.flat()
  }, [categories])

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
