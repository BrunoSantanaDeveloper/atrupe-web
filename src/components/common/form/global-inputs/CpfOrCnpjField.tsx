import React from 'react'

// Type Imports
import {
  type Path,
  type FieldValues,
  useFormContext,
  PathValue,
} from 'react-hook-form'
import { FormInput } from '../FormInput'
import { maskCnpj, maskCpf } from '@/lib/utils'
import { HandleValidateCnpj, HandleValidateCpf } from '@/lib/validateDocs'

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
}
export function CpfOrCnpjField<T extends FieldValues>({
  name,
  label = 'CPF ou CNPJ',
  placeholder = '000.000.000-00',
  width = 'flex-[1_0_100px]',
  ...props
}: Props<T>) {
  const { setValue, setError, clearErrors } = useFormContext<T>()

  return (
    <FormInput<T>
      name={name}
      label={label}
      width={width}
      maxLength={18}
      minLength={14}
      placeholder={placeholder}
      additionalOnChange={(value) => {
        const valueWithoutMask = String(value)?.replace(/\D/g, '')
        if (valueWithoutMask?.length === 14) {
          const cnpj = maskCnpj(valueWithoutMask)
          setValue(name, cnpj as PathValue<T, Path<T>>)
        } else {
          const cpf = maskCpf(valueWithoutMask)
          setValue(name, cpf as PathValue<T, Path<T>>)
        }
      }}
      onBlur={(e) => {
        const valueWithoutMask = String(e?.target?.value)?.replace(/\D/g, '')

        if (valueWithoutMask?.length === 14) {
          const cnpjIsValid = HandleValidateCnpj(valueWithoutMask)
          if (!cnpjIsValid) {
            setError(name, {
              type: 'custom',
              message: 'Documento inválido',
            })
          } else {
            clearErrors(name)
          }
        } else {
          const cpfIsValid = HandleValidateCpf(valueWithoutMask)
          if (!cpfIsValid) {
            setError(name, {
              type: 'custom',
              message: 'Documento inválido',
            })
          } else {
            clearErrors(name)
          }
        }
      }}
      {...props}
    />
  )
}
