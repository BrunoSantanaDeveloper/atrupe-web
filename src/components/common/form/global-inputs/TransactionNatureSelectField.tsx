import React, { useMemo } from 'react'

// UI component Imports
import { FormSelect } from '../FormSelect'

// Type Imports
import type { Path, FieldValues } from 'react-hook-form'

// Hooks
import { useTransactionNature } from '@/hooks/queries/useTransactionNature'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  type?: 'receivable' | 'payable'
}

export function SelectTransactionNatureField<T extends FieldValues>({
  name,
  label = 'Natureza',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  type,
  ...props
}: Props<T>) {
  const { data: transactionNatures } = useTransactionNature(type)

  const options = useMemo(() => {
    if (!Array.isArray(transactionNatures)) return []

    const sorted = transactionNatures.sort((a, b) => {
      const endItems = ['Sócios']
      const aIsEnd = endItems.includes(a.description)
      const bIsEnd = endItems.includes(b.description)

      if (aIsEnd && !bIsEnd) return 1
      if (!aIsEnd && bIsEnd) return -1
      return 0
    })

    return sorted.map((nature) => ({
      value: nature.id,
      label: nature.description,
    }))
  }, [transactionNatures])

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
