import React from 'react'

// Type Imports
import {
  type Path,
  type FieldValues,
  useFormContext,
  PathValue,
} from 'react-hook-form'
import { FormInput } from '../FormInput'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
}

export function ZipCodeField<T extends FieldValues>({
  name,
  label = 'CEP',
  placeholder = '00000-000',
  width = 'flex-[1_0_100px]',
  ...props
}: Props<T>) {
  const { setValue } = useFormContext<T>()

  return (
    <FormInput<T>
      name={name}
      label={label}
      placeholder={placeholder}
      width={width}
      additionalOnChange={(value) => {
        let zipCode = String(value).replace(/\D/g, '') // Remove tudo que não é número
        if (zipCode.length > 8) zipCode = zipCode.slice(0, 8) // Limita a 8 dígitos

        // Aplica a máscara: 00000-000
        if (zipCode.length > 5) {
          zipCode = zipCode.replace(/(\d{5})(\d{1,3})/, '$1-$2')
        }

        setValue(name, zipCode as PathValue<T, Path<T>>)
      }}
      maxLength={9}
      {...props}
    />
  )
}
