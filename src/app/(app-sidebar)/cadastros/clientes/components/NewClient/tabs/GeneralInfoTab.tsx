import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormTextarea } from '@/components/common/form/FormTextarea'
import { NewClientFormType } from '../schema'
import { maskCpf, maskCnpj, MaskPhoneNumber } from '@/lib/utils'
import { useFormContext } from 'react-hook-form'

interface Props {
  type: 'PERSON' | 'COMPANY'
}

export function GeneralInfoTab({ type }: Props) {
  const { setValue } = useFormContext<NewClientFormType>()

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

      <FormInput<NewClientFormType> name="general.activity" label="Atividade" />

      <FormSelect<NewClientFormType>
        name="general.category"
        label="Categoria"
        options={[
          { label: 'Agência de Propaganda', value: '1' },
          { label: 'Comércio', value: '2' },
          { label: 'Distribuidora', value: '3' },
          { label: 'Estúdio Fotográfico', value: '4' },
          { label: 'Vereador', value: '5' },
        ]}
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
