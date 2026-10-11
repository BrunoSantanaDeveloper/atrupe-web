import { useFormContext } from 'react-hook-form'
import { NewClientFormType } from './schema'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { useEffect, useMemo } from 'react'
import { maskCpf, MaskPhoneNumber } from '@/lib/utils'
import { HandleValidateCpf } from '@/lib/validateDocs'
import { useCategoryOptions } from '@/hooks/queries/useCategoryOptions'
import { useDocumentQuery } from '@/hooks/useDocumentSearch'

export function PersonFields() {
  const { watch, setValue, setError, clearErrors } =
    useFormContext<NewClientFormType>()

  const cpf = watch('cpf')
  const { data: documentData } = useDocumentQuery(
    cpf?.length === 14 ? cpf : null,
  )
  const { data: categoryData } = useCategoryOptions('CLIENT')

  const categoryOptions = useMemo(() => categoryData || [], [categoryData])

  useEffect(() => {
    if (documentData && documentData.documentType === 'CPF') {
      setValue('name', documentData.name || '')
      setValue('rg', documentData.rg || '')
      setValue('phone', documentData.phone || '')
      setValue('birthdate', documentData.birthdate || '')
    }
  }, [documentData, setValue])

  return (
    <>
      <FormInput
        name="cpf"
        label="CPF"
        placeholder="Digite aqui"
        width="flex-[1_0_300px]"
        maxLength={14}
        additionalOnChange={(value) => {
          const cpf = maskCpf(String(value).replace(/\D/g, ''))
          setValue('cpf', cpf)
          clearErrors('cpf')
        }}
        onBlur={(e) => {
          const value = e.target.value
          if (value.length < 1) return

          const cpfIsValid = HandleValidateCpf(String(value).replace(/\D/g, ''))

          if (!cpfIsValid) {
            setError('cpf', {
              type: 'custom',
              message: 'CPF inválido',
            })
          }
        }}
      />
      <FormInput
        name="name"
        label="Nome"
        placeholder="Digite aqui"
        width="flex-[1_0_300px]"
      />

      <FormInput
        name="rg"
        label="RG"
        placeholder="Digite aqui"
        width="flex-[1_0_300px]"
      />

      <FormSelect
        name="category"
        label="Grupo"
        width="flex-[1_0_300px]"
        options={categoryOptions}
      />

      <FormInput
        name="email"
        label="E-mail"
        placeholder="Digite aqui"
        width="flex-[1_0_250px]"
      />

      <FormInput
        name="phone"
        label="Telefone"
        inputMode="tel"
        placeholder="Digite aqui"
        width="flex-[1_0_150px]"
        minLength={14}
        maxLength={15}
        additionalOnChange={(value) => {
          const phone = MaskPhoneNumber(String(value).replace(/\D/g, ''))
          setValue('phone', phone)
        }}
      />
      <FormInput
        name="mobile"
        label="Celular"
        inputMode="tel"
        placeholder="Digite aqui"
        width="flex-[1_0_150px]"
        minLength={14}
        maxLength={15}
        additionalOnChange={(value) => {
          const mobile = MaskPhoneNumber(String(value).replace(/\D/g, ''))
          setValue('mobile', mobile)
        }}
      />
    </>
  )
}
