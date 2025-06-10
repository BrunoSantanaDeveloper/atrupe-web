import { useCheckCpf } from '@/hooks/queries/useCheckCpf'
import { useFormContext } from 'react-hook-form'
import { NewClientFormType } from './schema'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { useEffect } from 'react'
import { maskCpf, MaskPhoneNumber } from '@/lib/utils'
import { HandleValidateCpf } from '@/lib/HandleValidateCpf'

export function PersonFields() {
  const { watch, setValue, setError, setFocus, clearErrors } =
    useFormContext<NewClientFormType>()

  const { data } = useCheckCpf(watch('cpf')?.replace(/\D/g, '') ?? '')

  useEffect(() => {
    setValue('name', data?.name || '')
  }, [data, setValue])

  return (
    <>
      <FormInput
        name="name"
        label="Nome"
        placeholder="Digite aqui"
        width="w-full"
      />
      <FormInput
        name="email"
        label="Email"
        placeholder="Digite aqui"
        width="flex-[1_0_300px]"
      />
      <FormSelect
        name="category"
        label="Categoria"
        width="flex-[1_0_300px]"
        options={[
          { label: 'Agência de Propaganda', value: '1' },
          { label: 'Comércio', value: '2' },
          { label: 'Distribuidora', value: '3' },
          { label: 'Estúdio Fotográfico', value: '4' },
          { label: 'Vereador', value: '5' },
        ]}
      />
      <FormInput
        name="rg"
        label="RG"
        placeholder="Digite aqui"
        width="flex-[1_0_300px]"
      />
      <FormInput
        name="cpf"
        label="CPF"
        placeholder="Digite aqui"
        width="flex-[1_0_300px]"
        maxLength={14}
        additionalOnChange={(value) => {
          const cpf = maskCpf(String(value).replace(/\D/g, ''))
          setValue('cpf', cpf)
        }}
        onBlur={(e) => {
          const cpfIsValid = HandleValidateCpf(
            String(e?.target?.value).replace(/\D/g, ''),
          )
          if (!cpfIsValid) {
            setError('cpf', {
              type: 'custom',
              message: 'CPF inválido',
            })
            setFocus('cpf')
          } else {
            clearErrors('cpf')
          }
        }}
      />

      <FormInput
        name="phone"
        label="Telefone"
        inputMode="tel"
        placeholder="Digite aqui"
        width="flex-[1_0_300px]"
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
        width="flex-[1_0_300px]"
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
