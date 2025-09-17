import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormTextarea } from '@/components/common/form/FormTextarea'
import { NewClientFormType } from '../schema'
import { maskCpf, maskCnpj, MaskPhoneNumber } from '@/lib/utils'
import { useFormContext } from 'react-hook-form'
import { useCategoryOptions } from '@/hooks/queries/useCategoryOptions'
import { useMemo, useCallback } from 'react'
import { useDocumentSearch } from '@/hooks/useDocumentSearch'

interface Props {
  type: 'PERSON' | 'COMPANY'
  context?: 'client' | 'supplier'
}

export function GeneralInfoTab({ type, context = 'client' }: Props) {
  const { setValue } = useFormContext<NewClientFormType>()
  const { searchByDocument } = useDocumentSearch()

  const { data: categoryData } = useCategoryOptions(
    context === 'supplier' ? 'SUPPLIER' : 'CLIENT',
  )

  const categoryOptions = useMemo(() => categoryData || [], [categoryData])

  const handleDocumentChange = useCallback(
    async (document: string, documentType: 'CPF' | 'CNPJ') => {
      const cleanDocument = document.replace(/[.\-/]/g, '')

      // Only search when document is complete
      const isComplete =
        (documentType === 'CPF' && cleanDocument.length === 11) ||
        (documentType === 'CNPJ' && cleanDocument.length === 14)

      if (!isComplete) return

      const searchData = await searchByDocument(cleanDocument)

      if (searchData) {
        // Fill general data
        setValue('general.name', searchData.name)
        if (searchData.phone) {
          setValue('general.phone', searchData.phone)
        }
        if (searchData.rg) {
          setValue('general.rg', searchData.rg)
        }

        if (documentType === 'CNPJ' && searchData.corporateName) {
          setValue('general.corporateName', searchData.corporateName)
        }

        // Fill address data if available
        if (searchData.address) {
          setValue('addresses.0.street', searchData.address.street)
          setValue('addresses.0.city', searchData.address.city)
          setValue('addresses.0.state', searchData.address.state)
          setValue('addresses.0.zipcode', searchData.address.zipcode)
          setValue('addresses.0.neighborhood', searchData.address.neighborhood)
        }
      }
    },
    [setValue, searchByDocument],
  )

  return (
    <div className="grid grid-cols-2 gap-4">
      {type === 'PERSON' && (
        <>
          <FormInput<NewClientFormType>
            name="general.cpf"
            label="CPF"
            placeholder="Digite aqui"
            additionalOnChange={(value) => {
              const maskedValue = maskCpf(String(value)) || ''
              setValue('general.cpf', maskedValue)
            }}
            onBlur={(e) => {
              handleDocumentChange(e.target.value, 'CPF')
            }}
            maxLength={14}
          />
        </>
      )}
      {type === 'COMPANY' && (
        <>
          <FormInput<NewClientFormType>
            name="general.cnpj"
            label="CNPJ"
            placeholder="Digite aqui"
            additionalOnChange={(value) => {
              const maskedValue = maskCnpj(String(value)) || ''
              setValue('general.cnpj', maskedValue)
            }}
            onBlur={(e) => {
              handleDocumentChange(e.target.value, 'CNPJ')
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

      {type === 'PERSON' && (
        <>
          <FormInput<NewClientFormType> name="general.rg" label="RG" />
        </>
      )}
      <FormInput<NewClientFormType>
        name="general.email"
        label="E-mail"
        placeholder="Digite aqui"
        type="email"
      />

      {/* <FormInput<NewClientFormType> name="general.activity" label="Atividade" /> */}

      <FormSelect<NewClientFormType>
        name="general.categoryId"
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
