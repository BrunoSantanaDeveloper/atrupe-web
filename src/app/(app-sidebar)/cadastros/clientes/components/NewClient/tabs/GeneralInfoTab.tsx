import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormTextarea } from '@/components/common/form/FormTextarea'
import { NewClientFormType } from '../schema'
import { maskCpf, maskCnpj, MaskPhoneNumber } from '@/lib/utils'
import { useFormContext } from 'react-hook-form'
import { useCategoryOptions } from '@/hooks/queries/useCategoryOptions'
import { useMemo, useCallback, useState } from 'react'
import { useDocumentSearch } from '@/hooks/useDocumentSearch'
import { FormCheckbox } from '@/components/common/form/FormCheckbox'
import { FormDatePickerInput } from '@/components/common/form/FormDatePickerInput'
import { Button } from '@/components/ui/button'
import { IconRefresh } from '@tabler/icons-react'
import { toast } from 'sonner'

interface Props {
  type: 'PERSON' | 'COMPANY'
  context?: 'client' | 'supplier'
}

export function GeneralInfoTab({ type, context = 'client' }: Props) {
  const { setValue, watch } = useFormContext<NewClientFormType>()
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

      // Reset fields before searching
      setValue('general.name', '')
      setValue('general.phone', '')
      setValue('general.rg', '')
      setValue('general.birthdate', undefined)
      setValue('general.corporateName', '')
      setValue('addresses.0.street', '')
      setValue('addresses.0.number', '')
      setValue('addresses.0.complement', '')
      setValue('addresses.0.city', '')
      setValue('addresses.0.state', '')
      setValue('addresses.0.zipcode', '')
      setValue('addresses.0.neighborhood', '')

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
        if (searchData.birthdate) {
          const date = new Date(
            searchData.birthdate.split('T')[0] + 'T12:00:00',
          )
          setValue('general.birthdate', date)
        }
        if (documentType === 'CNPJ' && searchData.corporateName) {
          setValue('general.corporateName', searchData.corporateName)
        }
        // Fill address data if available
        if (searchData.address) {
          setValue('addresses.0.street', searchData.address.street)
          if (searchData.address.number) {
            setValue('addresses.0.number', searchData.address.number)
          }
          if (searchData.address.complement) {
            setValue('addresses.0.complement', searchData.address.complement)
          }
          setValue('addresses.0.city', searchData.address.city)
          setValue('addresses.0.state', searchData.address.state)
          setValue('addresses.0.zipcode', searchData.address.zipcode)
          setValue('addresses.0.neighborhood', searchData.address.neighborhood)
        }
      }
    },
    [setValue, searchByDocument],
  )

  const [isRefreshing, setIsRefreshing] = useState(false)

  const currentDocument =
    type === 'PERSON'
      ? watch('general.cpf')?.replace(/[.\-/]/g, '') || ''
      : watch('general.cnpj')?.replace(/[.\-/]/g, '') || ''

  const hasDocument =
    type === 'PERSON'
      ? currentDocument.length === 11
      : currentDocument.length === 14

  const handleRefreshOfficialData = useCallback(async () => {
    if (!hasDocument || !currentDocument) return

    setIsRefreshing(true)
    try {
      const freshData = await searchByDocument(currentDocument)
      if (!freshData) {
        toast.error('Não foi possível obter dados oficiais.')
        return
      }

      const updated: string[] = []

      if (freshData.name && freshData.name !== watch('general.name')) {
        setValue('general.name', freshData.name)
        updated.push('Nome')
      }
      if (
        type === 'COMPANY' &&
        freshData.corporateName &&
        freshData.corporateName !== watch('general.corporateName')
      ) {
        setValue('general.corporateName', freshData.corporateName)
        updated.push('Razão Social')
      }
      if (freshData.phone && freshData.phone !== watch('general.phone')) {
        setValue('general.phone', freshData.phone)
        updated.push('Telefone')
      }
      if (freshData.address) {
        if (
          freshData.address.street &&
          freshData.address.street !== watch('addresses.0.street')
        ) {
          setValue('addresses.0.street', freshData.address.street)
          updated.push('Rua')
        }
        if (
          freshData.address.number &&
          freshData.address.number !== watch('addresses.0.number')
        ) {
          setValue('addresses.0.number', freshData.address.number)
          updated.push('Número')
        }
        if (
          freshData.address.neighborhood &&
          freshData.address.neighborhood !== watch('addresses.0.neighborhood')
        ) {
          setValue('addresses.0.neighborhood', freshData.address.neighborhood)
          updated.push('Bairro')
        }
        if (
          freshData.address.city &&
          freshData.address.city !== watch('addresses.0.city')
        ) {
          setValue('addresses.0.city', freshData.address.city)
          updated.push('Cidade')
        }
        if (
          freshData.address.state &&
          freshData.address.state !== watch('addresses.0.state')
        ) {
          setValue('addresses.0.state', freshData.address.state)
          updated.push('UF')
        }
        if (
          freshData.address.zipcode &&
          freshData.address.zipcode !== watch('addresses.0.zipcode')
        ) {
          setValue('addresses.0.zipcode', freshData.address.zipcode)
          updated.push('CEP')
        }
      }

      if (updated.length > 0) {
        toast.success(`Dados atualizados: ${updated.join(', ')}`)
      } else {
        toast.info('Todos os dados já estão atualizados.')
      }
    } catch {
      toast.error('Erro ao buscar dados oficiais.')
    } finally {
      setIsRefreshing(false)
    }
  }, [hasDocument, currentDocument, searchByDocument, setValue, watch, type])

  return (
    <div className="space-y-4">
      {hasDocument && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="neutralOutline"
            size="sm"
            onClick={handleRefreshOfficialData}
            disabled={isRefreshing}
          >
            <IconRefresh
              className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            {isRefreshing ? 'Atualizando...' : 'Atualizar dados oficiais'}
          </Button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {type === 'PERSON' && (
          <>
            <FormInput
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
            <FormInput
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
            <FormInput
              name="general.corporateName"
              label="Razão social"
              placeholder="Digite aqui"
              className="col-span-2"
            />
          </>
        )}
        <FormInput
          name="general.name"
          label={type === 'PERSON' ? 'Nome' : 'Nome fantasia'}
          placeholder="Digite aqui"
          className="col-span-2"
        />

        {type === 'COMPANY' && (
          <>
            <FormInput
              name="general.stateRegistration"
              label="Inscrição Estadual (IE)"
              placeholder="Somente números"
              maxLength={14}
            />
            <FormSelect
              name="general.indicadorIE"
              label="Indicador IE"
              options={[
                { label: 'Contribuinte ICMS', value: '1' },
                { label: 'Contribuinte Isento', value: '2' },
                { label: 'Não Contribuinte', value: '9' },
              ]}
            />
          </>
        )}

        {type === 'PERSON' && (
          <>
            <FormDatePickerInput
              name="general.birthdate"
              label="Data de nascimento"
              placeholder="Selecione a data"
            />
            <FormInput name="general.rg" label="RG" />
          </>
        )}
        <FormInput
          name="general.email"
          label="E-mail"
          placeholder="Digite aqui"
          type="email"
        />

        {/* <FormInput name="general.activity" label="Atividade" /> */}

        <FormSelect
          name="general.categoryId"
          label="Grupo"
          options={categoryOptions}
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

        <FormCheckbox
          name="general.isBranch"
          label="Filial (Não validar CPF / CNPJ)"
          className="my-4"
        />

        <div className="col-span-2">
          <FormTextarea
            name="general.notes"
            label="Observações gerais"
            placeholder="Digite aqui"
            className="col-span-2"
            rows={5}
          />
        </div>
      </div>
    </div>
  )
}
