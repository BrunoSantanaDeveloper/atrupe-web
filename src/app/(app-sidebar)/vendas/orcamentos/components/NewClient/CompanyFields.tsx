import { useFormContext } from 'react-hook-form'
import { NewClientFormType } from './schema'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { maskCnpj, MaskPhoneNumber } from '@/lib/utils'
import { HandleValidateCnpj } from '@/lib/validateDocs'
import { useCategoryOptions } from '@/hooks/queries/useCategoryOptions'
import { useEffect, useMemo } from 'react'
import { useDocumentQuery } from '@/hooks/useDocumentSearch'

export function CompanyFields() {
  const { watch, setValue, setError, clearErrors } =
    useFormContext<NewClientFormType>()

  const cnpj = watch('cnpj')
  const { data: documentData } = useDocumentQuery(
    cnpj?.length === 18 ? cnpj : null,
  )
  const { data: categoryData } = useCategoryOptions('CLIENT')
  const categoryOptions = useMemo(() => categoryData || [], [categoryData])

  useEffect(() => {
    if (documentData && documentData.documentType === 'CNPJ') {
      setValue('name', documentData.name || '')
      setValue('corporateName', documentData.corporateName || '')
      setValue('phone', documentData.phone || '')
    }
  }, [documentData, setValue])

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
          clearErrors('cnpj')
        }}
        onBlur={(e) => {
          const value = e.target.value
          if (value.length < 1) return

          const cnpjIsValid = HandleValidateCnpj(
            String(value).replace(/\D/g, ''),
          )

          if (!cnpjIsValid) {
            setError('cnpj', {
              type: 'custom',
              message: 'CNPJ inválido',
            })
          }
        }}
        placeholder="Digite aqui"
      />

      <FormInput<NewClientFormType>
        name="name"
        label="Nome fantasia"
        width="flex-[1_0_300px]"
        placeholder="Digite aqui"
      />

      <FormInput<NewClientFormType>
        name="corporateName"
        label="Razão social"
        width="flex-[1_0_300px]"
        placeholder="Digite aqui"
      />

      <FormSelect<NewClientFormType>
        name="category"
        label="Grupo"
        width="flex-[1_0_300px]"
        options={categoryOptions}
      />

      <FormInput<NewClientFormType>
        name="email"
        label="E-mail"
        type="email"
        width="flex-[1_0_250px]"
        placeholder="Digite aqui"
      />

      <FormInput<NewClientFormType>
        name="phone"
        label="Telefone"
        inputMode="tel"
        width="flex-[1_0_150px]"
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
        width="flex-[1_0_150px]"
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
