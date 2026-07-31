'use client'

import { useEffect, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn, maskZipCode } from '@/lib/utils'
import { useCheckZipcode } from '@/hooks/queries/useCheckZipcode'

interface AddressFields {
  street: string
  neighborhood: string
  city: string
  state: string
}

interface Props
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  name: string
  label?: string
  width?: string
  addressFields: AddressFields
  onAddressFound?: (data: {
    street: string
    neighborhood: string
    city: string
    state: string
  }) => void
}

export function FormInputZipCode({
  name,
  label = 'CEP',
  width = 'flex-[1_1_300px]',
  addressFields,
  onAddressFound,
  ...props
}: Props) {
  const { control, setValue } = useFormContext()
  const [currentZipCode, setCurrentZipCode] = useState('')
  const lastAppliedZipCode = useRef('')

  // Hook para buscar dados do CEP (só ativa quando CEP tem 8 dígitos)
  const shouldFetchZipcode = currentZipCode.length === 8
  const { data: zipcodeData, isLoading } = useCheckZipcode(
    shouldFetchZipcode ? currentZipCode : '',
  )

  // Preenche os campos automaticamente quando os dados do CEP são retornados
  // Usa ref para garantir que só aplica uma vez por CEP, evitando sobrescrever edições manuais
  useEffect(() => {
    if (
      zipcodeData &&
      shouldFetchZipcode &&
      lastAppliedZipCode.current !== currentZipCode
    ) {
      lastAppliedZipCode.current = currentZipCode

      const addressData = {
        street: zipcodeData.street || '',
        neighborhood: zipcodeData.neighborhood || '',
        city: zipcodeData.city || '',
        state: zipcodeData.state || '',
      }

      // Preenche os campos do formulário
      setValue(addressFields.street, addressData.street, {
        shouldValidate: false,
      })
      setValue(addressFields.neighborhood, addressData.neighborhood, {
        shouldValidate: false,
      })
      setValue(addressFields.city, addressData.city, {
        shouldValidate: false,
      })
      setValue(addressFields.state, addressData.state, {
        shouldValidate: false,
      })

      // Callback opcional
      onAddressFound?.(addressData)
    }
  }, [
    zipcodeData,
    shouldFetchZipcode,
    currentZipCode,
    setValue,
    addressFields,
    onAddressFound,
  ])

  const handleZipCodeChange = (value: string) => {
    const digits = String(value).replace(/\D/g, '').slice(0, 8)

    // Atualiza o estado para buscar CEP
    setCurrentZipCode(digits)

    // Aplica a máscara: 00000-000
    return maskZipCode(digits)
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('flex flex-col', width)}>
          {label ? <FormLabel>{label}</FormLabel> : null}
          <FormControl>
            <Input
              placeholder="00000-000"
              maxLength={9}
              inputMode="numeric"
              autoComplete="postal-code"
              {...field}
              {...props}
              // Valores carregados da API podem vir sem máscara (ex: "88103000")
              value={maskZipCode(field.value)}
              disabled={isLoading || props.disabled}
              onChange={(e) => {
                const maskedValue = handleZipCodeChange(e.target.value)
                field.onChange(maskedValue)
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
