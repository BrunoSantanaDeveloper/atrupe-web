import React, { useMemo } from 'react'

// UI component Imports
import { FormSelect, SelectBasic } from '../FormSelect'

// Type Imports
import type { Path, FieldValues } from 'react-hook-form'

// Hooks
import { useSerie } from '@/hooks/queries/useSerie'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  // Filtros compactos: sem o rótulo em cima, o "todos" diz o que é
  hideLabel?: boolean
  allLabel?: string
  noForm?: boolean
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
}

export function SelectSerieField<T extends FieldValues>({
  name,
  label = 'Série',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  value,
  onChange,
  noForm,
  disabled,
  hideLabel,
  allLabel = 'Todos',
  ...props
}: Props<T>) {
  const { data } = useSerie(noForm ? undefined : true)

  const series = data?.data
  const options = useMemo(() => {
    return series?.map((serie) => ({
      value: serie.id,
      label: `${serie.code} - ${serie.description}`,
    }))
  }, [series])

  if (noForm)
    return (
      <SelectBasic
        name={name}
        label={label}
        placeholder={placeholder}
        options={[{ value: 'all', label: allLabel }, ...(options || [])]}
        hideLabel={hideLabel}
        value={value}
        onChange={onChange}
        className={width}
        disabled={disabled}
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
      additionalOnChange={onChange}
      disabled={disabled}
      {...props}
    />
  )
}
