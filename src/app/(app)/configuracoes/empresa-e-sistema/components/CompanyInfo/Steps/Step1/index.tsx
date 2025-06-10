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
      <FormInput<CompanyFormType>
        name="general.legalName"
        label="Nome Fantasia"
        placeholder="Digite aqui"
      />
      <FormInput<CompanyFormType>
        name="general.name"
        label="Razão Social"
        placeholder="Digite aqui"
      />
      <FormInput<CompanyFormType>
        name="general.cnpj"
        label="CNPJ"
        placeholder="Digite aqui"
        additionalOnChange={(value) => {
          setValue('general.cnpj', maskCnpj(String(value)))
        }}
        maxLength={18}
      />
      <FormInput<CompanyFormType>
        name="general.municipalRegistration"
        label="Inscrição Estadual"
        placeholder="Digite aqui"
      />
      <FormInput<CompanyFormType>
        name="general.email"
        label="E-mail"
        type="email"
        placeholder="Digite aqui"
      />
      <FormInput<CompanyFormType>
        name="general.siteUrl"
        label="Site"
        type="url"
        placeholder="Digite aqui"
      />
      <FormInput<CompanyFormType>
        name="general.phone"
        label="Telefone"
        inputMode="tel"
        placeholder="Digite aqui"
        additionalOnChange={(value) => {
          setValue('general.phone', MaskPhoneNumber(value) || '')
        }}
        maxLength={15}
      />

      <FormInput<CompanyFormType>
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
