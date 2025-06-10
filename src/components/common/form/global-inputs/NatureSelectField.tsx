import React, { useMemo } from 'react'

// UI
import { FormSelect, SelectBasic } from '../FormSelect'

// Type
import type { Path, FieldValues } from 'react-hook-form'

// Hooks
import { useNatures } from '@/hooks/queries/useNature'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  noForm?: boolean
  value?: string
  level1?: string
  level2?: string
  onChange?: (value: string) => void
}

export function SelectNatureField<T extends FieldValues>({
  name,
  label = 'Natureza',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  value,
  onChange,
  noForm,
  level1,
  level2,
  ...props
}: Props<T>) {
  const { data: natures } = useNatures(level1, level2)

  const options = useMemo(() => {
    if (!natures) return []

    return natures?.map((nature) => ({
      value: nature.code,
      label: `${nature.code} - ${nature.description || 'Sem descrição'}`,
    }))
  }, [natures])

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
