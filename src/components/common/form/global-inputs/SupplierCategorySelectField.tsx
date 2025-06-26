// import React, { useMemo } from 'react'

// UI component Imports
import { SelectBasic } from '../FormSelect'

// Type Imports
import type { Path, FieldValues } from 'react-hook-form'
import { supplierCategoryOptions } from '@/consts/supplier'

// Hooks
// import { useClientCategory } from '@/hooks/queries/useClientCategory'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  className?: string
  value?: string
  onChange?: (value: string) => void
}

export function SupplierCategorySelectField<T extends FieldValues>({
  name,
  label = 'Categoria de cliente',
  placeholder = label,
  className = 'flex-[1_0_100px]',
  ...props
}: Props<T>) {
  // const { data: clientCategories } = useClientCategory() || []

  // const options =
  //   useMemo(() => {
  //     return clientCategories?.map((sector) => ({
  //       value: sector.id,
  //       label: sector.name,
  //     }))
  //   }, [clientCategories]) || []

  return (
    <SelectBasic
      name={name}
      label={label}
      placeholder={placeholder}
      options={[{ value: 'all', label: 'Todas' }, ...supplierCategoryOptions]}
      className={className}
      {...props}
    />
  )
}
