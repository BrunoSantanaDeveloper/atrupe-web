'use client'

// Component Imports
import { FormInput } from '@/components/common/form/FormInput'

// Type Imports
import { CompanyFormType } from '../../schema'
import { useCheckZipcode } from '@/hooks/queries/useCheckZipcode'
import { useFormContext } from 'react-hook-form'
import { useEffect } from 'react'

export function Step2() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="mt-auto col-span-2">
        <ZipcodeField />
      </div>
      <div className="mt-auto col-span-2">
        <FormInput<CompanyFormType> name={`address.state`} label="Estado" />
      </div>
      <div className="col-span-full flex gap-4 items-baseline">
        <FormInput<CompanyFormType> name={`address.city`} label="Cidade" />
        <FormInput<CompanyFormType>
          name={`address.neighborhood`}
          label="Bairro"
        />
      </div>
      <FormInput<CompanyFormType> name={`address.number`} label="Número" />
      <div className="col-span-3">
        <FormInput<CompanyFormType> name={`address.street`} label="Rua" />
      </div>
      <div className="col-span-full">
        <FormInput<CompanyFormType>
          name={`address.complement`}
          label="Complemento"
        />
      </div>
    </div>
  )
}

function ZipcodeField() {
  const { watch, setValue, trigger } = useFormContext<CompanyFormType>()
  const zipcode = watch(`address.zipcode`)

  const { data } = useCheckZipcode(zipcode?.replace(/\D/g, ''))

  useEffect(() => {
    if (data) {
      setValue(`address.street`, data.street)
      setValue(`address.neighborhood`, data.neighborhood)
      setValue(`address.city`, data.city)
      setValue(`address.state`, data.state)
      trigger(`address`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, setValue])

  return (
    <FormInput<CompanyFormType>
      name={`address.zipcode`}
      label="CEP"
      placeholder="00000-000"
      additionalOnChange={(value) => {
        let zipcode = String(value).replace(/\D/g, '') // Remove tudo que não é número
        if (zipcode.length > 8) zipcode = zipcode.slice(0, 8) // Limita a 8 dígitos

        // Aplica a máscara: 00000-000
        if (zipcode.length > 5) {
          zipcode = zipcode.replace(/(\d{5})(\d{1,3})/, '$1-$2')
        }

        setValue(`address.zipcode`, zipcode)
      }}
      maxLength={9}
    />
  )
}
