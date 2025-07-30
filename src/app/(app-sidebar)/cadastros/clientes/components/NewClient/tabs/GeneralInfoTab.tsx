import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormTextarea } from '@/components/common/form/FormTextarea'
import { NewClientFormType } from '../schema'
import { maskCpf, maskCnpj, MaskPhoneNumber } from '@/lib/utils'
import { useFormContext } from 'react-hook-form'
import { useCategoryOptions } from '@/hooks/queries/useCategoryOptions'
import { useMemo } from 'react'

interface Props {
  type: 'PERSON' | 'COMPANY'
  context?: 'client' | 'supplier'
}

export function GeneralInfoTab({ type, context = 'client' }: Props) {
  const { setValue } = useFormContext<NewClientFormType>()

  const { data: categoryData } = useCategoryOptions(
    context === 'supplier' ? 'SUPPLIER' : 'CLIENT',
  )

  const categoryOptions = useMemo(() => categoryData || [], [categoryData])

  return (
    <div className="grid grid-cols-2 gap-4">
      {type === 'COMPANY' && (
        <>
          <FormInput<NewClientFormType>
            name="general.cnpj"
            label="CNPJ"
            placeholder="Digite aqui"
            additionalOnChange={(value) => {
              setValue('general.cnpj', maskCnpj(String(value)) || '')
            }}
            maxLength={18}
          />
        </>
      )}
      {type === 'COMPANY' && (
        <>
          <FormInput<NewClientFormType>
            name="general.corporateName"
            label="Razão social"
            placeholder="Digite aqui"
            className="col-span-2"
          />
        </>
      )}
      <FormInput<NewClientFormType>
        name="general.name"
        label={type === 'PERSON' ? 'Nome' : 'Nome fantasia'}
        placeholder="Digite aqui"
        className="col-span-2"
      />
      <FormInput<NewClientFormType>
        name="general.email"
        label="E-mail"
        placeholder="Digite aqui"
        type="email"
      />

      {type === 'PERSON' && (
        <>
          <FormInput<NewClientFormType>
            name="general.cpf"
            label="CPF"
            placeholder="Digite aqui"
            additionalOnChange={(value) => {
              setValue('general.cpf', maskCpf(String(value)) || '')
            }}
            maxLength={14}
          />
          <FormInput<NewClientFormType> name="general.rg" label="RG" />
        </>
      )}

      {/* <FormInput<NewClientFormType> name="general.activity" label="Atividade" /> */}

      <FormSelect<NewClientFormType>
        name="general.category"
        label="Grupo"
        options={categoryOptions}
      />

      <FormInput<NewClientFormType>
        name="general.phone"
        label="Telefone"
        inputMode="tel"
        placeholder="Digite aqui"
        additionalOnChange={(value) => {
          setValue('general.phone', MaskPhoneNumber(value) || '')
        }}
        maxLength={15}
      />

      <FormInput<NewClientFormType>
        name="general.mobile"
        label="Celular"
        inputMode="tel"
        placeholder="Digite aqui"
        additionalOnChange={(value) => {
          setValue('general.mobile', MaskPhoneNumber(value) || '')
        }}
        maxLength={15}
      />
      <div className="col-span-2">
        <FormTextarea<NewClientFormType>
          name="general.notes"
          label="Observações gerais"
          placeholder="Digite aqui"
          className="col-span-2"
          rows={5}
        />
      </div>
    </div>
  )
}
