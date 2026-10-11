import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormTextarea } from '@/components/common/form/FormTextarea'
import { NewClientFormType } from '../schema'
import { maskCpf, maskCnpj, isValidCpfCnpj, MaskPhoneNumber } from '@/lib/utils'
import { useFormContext } from 'react-hook-form'

import { useCategoryOptions } from '@/hooks/queries/useCategoryOptions'
import { useMemo, useCallback, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'
import { useDocumentSearch } from '@/hooks/useDocumentSearch'
import { FormCheckbox } from '@/components/common/form/FormCheckbox'
import { FormDatePickerInput } from '@/components/common/form/FormDatePickerInput'
import { Button } from '@/components/ui/button'
import { IconRefresh } from '@tabler/icons-react'
import { toast } from 'sonner'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { RecipientFiscalFields } from '@/components/common/fiscal/RecipientFiscalFields'
import { SelectSellerField } from '@/components/common/form/global-inputs/SellersSelectField'

/**
 * O último documento consultado e o que a consulta preencheu (UX-2). Fica no
 * formulário, e não na aba: a aba desmonta ao trocar para outra, e o registro
 * se perderia no caminho.
 */
export type DocumentLookup = {
  document: string
  values: Record<string, string | Date>
}

interface Props {
  type: 'PERSON' | 'COMPANY'
  context?: 'client' | 'supplier'
  lookupRef?: MutableRefObject<DocumentLookup | null>
}

export function GeneralInfoTab({ type, context = 'client', lookupRef }: Props) {
  const { setValue, watch, getValues } = useFormContext<NewClientFormType>()
  const { searchByDocument } = useDocumentSearch()
  const { canManageClientResponsible } = usePlanFeatures()
  const showResponsible = context === 'client' && canManageClientResponsible()

  const primaryCountry = watch('addresses.0.country')
  const isForeign = !!(primaryCountry && primaryCountry !== 'Brasil')

  const { data: categoryData } = useCategoryOptions(
    context === 'supplier' ? 'SUPPLIER' : 'CLIENT',
  )

  const categoryOptions = useMemo(() => categoryData || [], [categoryData])

  type FieldName = Parameters<typeof setValue>[0]

  // O último documento consultado e o que a consulta preencheu: trocar o
  // documento limpa o que veio da consulta anterior (UX-2). Vem do formulário;
  // sem ele, vale enquanto a aba estiver montada
  const ownLookup = useRef<DocumentLookup | null>(null)
  const lastLookup = lookupRef ?? ownLookup

  const handleDocumentChange = useCallback(
    async (document: string, documentType: 'CPF' | 'CNPJ') => {
      const cleanDocument = document.replace(/[.\-/]/g, '')

      // Only search when document is complete
      const isComplete =
        (documentType === 'CPF' && cleanDocument.length === 11) ||
        (documentType === 'CNPJ' && cleanDocument.length === 14)

      if (!isComplete) return

      // EC-14: documento inválido não consulta. Antes, um CPF digitado errado
      // trazia e gravava os dados de outra pessoa — o cadastro era salvo com o
      // nome de um terceiro.
      if (!isValidCpfCnpj(cleanDocument)) return

      // UX-2: com outro documento, o que a consulta anterior preencheu e o
      // usuário não mexeu sai. Sem isso, trocar o CNPJ da empresa A pelo da B
      // deixava o cadastro com o CNPJ de B e o nome e o endereço de A. O que
      // o usuário digitou ou editou fica (EC-14)
      const previous = lastLookup.current
      if (previous && previous.document !== cleanDocument) {
        for (const [field, value] of Object.entries(previous.values)) {
          const name = field as FieldName
          const current = getValues(name)
          if (value instanceof Date) {
            if (
              current instanceof Date &&
              current.getTime() === value.getTime()
            ) {
              setValue('general.birthdate', undefined)
            }
          } else if (current === value) {
            setValue(name, '' as never)
          }
        }
        lastLookup.current = null
      }

      const searchData = await searchByDocument(cleanDocument)

      if (searchData) {
        // EC-14: a consulta não apaga mais o que o usuário digitou. Só
        // preenche o que estiver vazio.
        const filled: Record<string, string | Date> = {}
        const fillIfEmpty = (field: FieldName, value?: string | null) => {
          if (!value) return
          if (getValues(field)) return

          setValue(field, value)
          filled[field] = value
        }

        fillIfEmpty('general.name', searchData.name)
        fillIfEmpty('general.phone', searchData.phone)
        fillIfEmpty('general.rg', searchData.rg)

        if (searchData.birthdate && !getValues('general.birthdate')) {
          const date = new Date(
            searchData.birthdate.split('T')[0] + 'T12:00:00',
          )
          setValue('general.birthdate', date)
          filled['general.birthdate'] = date
        }

        if (documentType === 'CNPJ') {
          fillIfEmpty('general.corporateName', searchData.corporateName)
        }

        if (searchData.address) {
          fillIfEmpty('addresses.0.street', searchData.address.street)
          fillIfEmpty('addresses.0.number', searchData.address.number)
          fillIfEmpty('addresses.0.complement', searchData.address.complement)
          fillIfEmpty('addresses.0.city', searchData.address.city)
          fillIfEmpty('addresses.0.state', searchData.address.state)
          fillIfEmpty('addresses.0.zipcode', searchData.address.zipcode)
          fillIfEmpty(
            'addresses.0.neighborhood',
            searchData.address.neighborhood,
          )
        }

        // A mesma consulta de novo soma ao que já tinha vindo dela
        const keep =
          lastLookup.current?.document === cleanDocument
            ? lastLookup.current.values
            : {}
        lastLookup.current = {
          document: cleanDocument,
          values: { ...keep, ...filled },
        }
      }
    },
    [setValue, getValues, searchByDocument, lastLookup],
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
        updated.push('Razão social')
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
              label={isForeign ? 'Identificação Estrangeiro' : 'CPF'}
              placeholder={isForeign ? 'Passaporte ou ID' : 'Digite aqui'}
              additionalOnChange={
                !isForeign
                  ? (value) => {
                      const maskedValue = maskCpf(String(value)) || ''
                      setValue('general.cpf', maskedValue)
                    }
                  : undefined
              }
              onBlur={
                !isForeign
                  ? (e) => {
                      handleDocumentChange(e.target.value, 'CPF')
                    }
                  : undefined
              }
              maxLength={isForeign ? 20 : 14}
            />
          </>
        )}
        {type === 'COMPANY' && (
          <>
            <FormInput
              name="general.cnpj"
              label={isForeign ? 'Identificação Estrangeiro' : 'CNPJ'}
              placeholder={isForeign ? 'ID Estrangeiro' : 'Digite aqui'}
              additionalOnChange={
                !isForeign
                  ? (value) => {
                      const maskedValue = maskCnpj(String(value)) || ''
                      setValue('general.cnpj', maskedValue)
                    }
                  : undefined
              }
              onBlur={
                !isForeign
                  ? (e) => {
                      handleDocumentChange(e.target.value, 'CNPJ')
                    }
                  : undefined
              }
              maxLength={isForeign ? 20 : 18}
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

        {/* Campos fiscais (IE / Indicador IE) */}
        <RecipientFiscalFields
          namePrefix="general."
          fieldWidth="flex-[1_0_250px]"
        />

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

        {showResponsible && (
          <SelectSellerField<NewClientFormType>
            name="responsibleId"
            label="Responsável"
            placeholder="Selecione o responsável"
            width="col-span-1"
          />
        )}

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
