import { useFormContext } from 'react-hook-form'
import { NewClientFormType } from './schema'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { maskCnpj, MaskPhoneNumber } from '@/lib/utils'
import { HandleValidateCnpj } from '@/lib/validateDocs'
import { useCategoryOptions } from '@/hooks/queries/useCategoryOptions'
import { useMemo } from 'react'

export function CompanyFields() {
  const { setValue, setError, setFocus, clearErrors } =
    useFormContext<NewClientFormType>()

  const { data: categoryData } = useCategoryOptions('CLIENT')
  const categoryOptions = useMemo(() => categoryData || [], [categoryData])

  return (
    <div className="flex flex-wrap gap-5">
      <FormInput<NewClientFormType>
        name="cnpj"
        label="CNPJ"
        width="flex-[1_0_300px]"
        maxLength={18}
        minLength={18}
        additionalOnChange={(value) => {
          const cnpj = maskCnpj(String(value).replace(/\D/g, ''))
          setValue('cnpj', cnpj)
        }}
        onBlur={(e) => {
          const cnpjIsValid = HandleValidateCnpj(
            String(e?.target?.value).replace(/\D/g, ''),
          )
          if (!cnpjIsValid) {
            setError('cnpj', {
              type: 'custom',
              message: 'CNPJ inválido',
            })
            setFocus('cnpj')
          } else {
            clearErrors('cnpj')
          }
        }}
        placeholder="Digite aqui"
      />
      {/* <FormInput<NewClientFormType>
        name="activity"
        label="Atividade"
        width="flex-[1_0_300px]"
        placeholder="Digite aqui"
      /> */}
      <FormInput<NewClientFormType>
        name="name"
        label="Nome Fantasia"
        width="flex-[1_0_300px]"
        placeholder="Digite aqui"
      />
      <FormInput<NewClientFormType>
        name="corporateName"
        label="Razão Social"
        width="flex-[1_0_300px]"
        placeholder="Digite aqui"
      />
      <FormInput<NewClientFormType>
        name="email"
        label="Email"
        type="email"
        width="flex-[1_0_300px]"
        placeholder="Digite aqui"
      />
      <FormSelect<NewClientFormType>
        name="category"
        label="Categoria"
        width="flex-[1_0_300px]"
        options={categoryOptions}
      />
      <FormInput<NewClientFormType>
        name="phone"
        label="Telefone"
        inputMode="tel"
        width="flex-[1_0_300px]"
        placeholder="Digite aqui"
        minLength={14}
        maxLength={15}
        additionalOnChange={(value) => {
          const phone = MaskPhoneNumber(String(value).replace(/\D/g, ''))
          setValue('phone', phone)
        }}
      />
      <FormInput<NewClientFormType>
        name="mobile"
        label="Celular"
        inputMode="tel"
        width="flex-[1_0_300px]"
        placeholder="Digite aqui"
        minLength={14}
        maxLength={15}
        additionalOnChange={(value) => {
          const phone = MaskPhoneNumber(String(value).replace(/\D/g, ''))
          setValue('mobile', phone)
        }}
      />
    </div>
  )
}
