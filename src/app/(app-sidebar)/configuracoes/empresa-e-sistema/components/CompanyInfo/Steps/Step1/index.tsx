'use client'

// Component Imports
import { FormInput } from '@/components/common/form/FormInput'
import { useFormContext } from 'react-hook-form'
import { CompanyFormType } from '../../schema'
import { maskCnpj, MaskPhoneNumber } from '@/lib/utils'

export function Step1() {
  const { setValue } = useFormContext<CompanyFormType>()

  return (
    <div className="grid grid-cols-2 gap-4">
      <FormInput
        name="general.name"
        label="Nome fantasia"
        placeholder="Digite aqui"
      />
      <FormInput
        name="general.legalName"
        label="Razão social"
        placeholder="Digite aqui"
      />
      <FormInput
        name="general.cnpj"
        label="CNPJ"
        placeholder="Digite aqui"
        additionalOnChange={(value) => {
          setValue('general.cnpj', maskCnpj(String(value)))
        }}
        maxLength={18}
      />

      <FormInput
        name="general.email"
        label="E-mail"
        type="email"
        placeholder="Digite aqui"
      />
      <FormInput
        name="general.siteUrl"
        label="Site"
        type="url"
        placeholder="Digite aqui"
      />
      <FormInput
        name="general.phone"
        label="Telefone"
        inputMode="tel"
        placeholder="Digite aqui"
        additionalOnChange={(value) => {
          setValue('general.phone', MaskPhoneNumber(value) || '')
        }}
        maxLength={15}
      />

      <FormInput
        name="general.mobile"
        label="Celular"
        inputMode="tel"
        placeholder="Digite aqui"
        additionalOnChange={(value) => {
          setValue('general.mobile', MaskPhoneNumber(value) || '')
        }}
        maxLength={15}
      />
    </div>
  )
}
