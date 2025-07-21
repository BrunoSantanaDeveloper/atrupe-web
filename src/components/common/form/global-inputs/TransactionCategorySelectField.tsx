import React, { useMemo } from 'react'

// UI component Imports
import { FormSelect } from '../FormSelect'

// Type Imports
import type { Path, FieldValues } from 'react-hook-form'

// Hooks
import { useTransactionCategory } from '@/hooks/queries/useTransactionCategory'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  natureId: string
  listAll?: boolean
}

export function SelectTransactionCategoryField<T extends FieldValues>({
  name,
  label = 'Categoria',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  natureId,
  listAll,
  ...props
}: Props<T>) {
  const { data: transactionCategories } = useTransactionCategory({
    natureId,
    listAll,
  })

  const options = useMemo(() => {
    if (!Array.isArray(transactionCategories)) return []

    return transactionCategories.map((category) => ({
      value: category.id,
      label: `${category.code} - ${category.description}`,
    }))
  }, [transactionCategories])

  return (
    <FormSelect<T>
      name={name}
      label={label}
      placeholder={placeholder}
      options={options ?? []}
      width={width}
      emptyMessage="Sem categorias para a natureza"
      {...props}
    />
  )
}
