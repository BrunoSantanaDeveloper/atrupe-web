import { useFormContext, useFieldArray } from 'react-hook-form'
import { FormInput } from '@/components/common/form/FormInput'
import { CheckboxBasic } from '@/components/common/form/FormCheckbox'
import { RegularizadoMark } from '../RegularizadoMark'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { FormSelect } from '@/components/common/form/FormSelect'
import { Button } from '@/components/ui/button'
import { COUNTRIES } from '@/consts/country-codes'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'
import { NewClientFormType } from '../schema'
import { useCheckZipcode } from '@/hooks/queries/useCheckZipcode'
import { useEffect } from 'react'
import { FeaturedIcon } from '@/components/ui/featured-icon'

const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({
  value: c.namePt,
  label: c.namePt,
}))

// A marca de "obrigatório para regularizado" só no cliente (a aba também
// serve ao fornecedor): endereço completo é parte da regra (ALT-4). Antes a
// tela olhava o endereço da página, e o "Novo cliente" aberto no orçamento
// ou na frente de caixa ficava sem as marcas do endereço (Lista Lite 19/11,
// item 9): agora quem chama diz se é fornecedor
type Context = 'client' | 'supplier'

function useAddressMark(context: Context) {
  return context === 'client' ? <RegularizadoMark /> : null
}

// O número não entra na regra do regularizado, mas a NF-e pede (o "S/N"
// vale quando o endereço não tem número)
function useNumberMark(context: Context) {
  const { hasFiscalModule } = usePlanFeatures()
  return context === 'client' && hasFiscalModule() ? (
    <RegularizadoMark hint="Para emitir NF-e: o número do endereço, ou S/N quando não houver. Não impede o cliente regularizado." />
  ) : null
}

export function AddressTab({ context = 'client' }: { context?: Context }) {
  const addressMark = useAddressMark(context)
  const numberMark = useNumberMark(context)
  const { control, setValue, watch } = useFormContext<NewClientFormType>()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'addresses',
  })

  const handleAddAddress = () => {
    append({
      type: '',
      zipcode: '',
      state: '',
      city: '',
      neighborhood: '',
      street: '',
      number: '',
      complement: '',
      country: 'Brasil',
    })
  }

  return (
    <div className="space-y-6">
      {fields.map((field, index) => {
        const country = watch(`addresses.${index}.country`)
        const isForeign = !!(country && country !== 'Brasil')

        return (
          <div key={field.id} className="relative space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="type-card-title">Endereço {index + 1}</h3>
              {index > 0 && (
                <Button
                  type="button"
                  size="iconSm"
                  variant="neutralGhost"
                  className="absolute top-1 right-1"
                  onClick={() => remove(index)}
                >
                  <IconTrash aria-hidden size={ICON_SIZE.sm} />
                </Button>
              )}
            </div>

            {/* País */}
            <div className="max-w-xs">
              <FormSelect<NewClientFormType>
                name={`addresses.${index}.country`}
                label="País"
                options={COUNTRY_OPTIONS}
                additionalOnChange={(val) => {
                  if (val && val !== 'Brasil') {
                    setValue(`addresses.${index}.zipcode`, '')
                    setValue(`addresses.${index}.state`, 'EX')
                    setValue(`addresses.${index}.city`, 'EXTERIOR')
                    setValue(`addresses.${index}.neighborhood`, '')
                  } else {
                    setValue(`addresses.${index}.state`, '')
                    setValue(`addresses.${index}.city`, '')
                    setValue(`addresses.${index}.zipcode`, '')
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormInput<NewClientFormType>
                name={`addresses.${index}.type`}
                label="Título do endereço"
                placeholder="Ex: Sede, Fábrica, Filial SP"
              />
              {!isForeign ? (
                <ZipcodeField index={index} context={context} />
              ) : (
                <div></div>
              )}
              <div className="mt-auto">
                <FormInput<NewClientFormType>
                  name={`addresses.${index}.state`}
                  labelSuffix={addressMark}
                  label="Estado"
                  disabled={isForeign}
                />
              </div>
              <div className="col-span-full flex gap-4 items-baseline">
                <FormInput<NewClientFormType>
                  name={`addresses.${index}.city`}
                  labelSuffix={addressMark}
                  label="Cidade"
                  disabled={isForeign}
                />
                {!isForeign ? (
                  <FormInput<NewClientFormType>
                    name={`addresses.${index}.neighborhood`}
                    labelSuffix={addressMark}
                    label="Bairro"
                  />
                ) : (
                  <div></div>
                )}
              </div>
              <NumberField index={index} labelSuffix={numberMark} />
              <div className="col-span-2">
                <FormInput<NewClientFormType>
                  name={`addresses.${index}.street`}
                  labelSuffix={addressMark}
                  label="Rua"
                />
              </div>
              <div className="col-span-3">
                <FormInput<NewClientFormType>
                  name={`addresses.${index}.complement`}
                  label="Complemento"
                />
              </div>
            </div>
            <div className="my-6 border border-b-gray-300"></div>
          </div>
        )
      })}
      <div className="w-full flex justify-center">
        <Button type="button" variant="ghost" onClick={handleAddAddress}>
          <FeaturedIcon tone="brand" Icon={IconPlus} />
          Adicionar endereço
        </Button>
      </div>
    </div>
  )
}

// Componente auxiliar para o CEP com auto-complete
// O número com a caixinha "S/N" (Lista Lite 19/11, item 9), como o ISENTO
// da inscrição estadual: marcada, o campo grava "S/N" e trava, e ninguém
// digita "sn", "s/n" ou "0" de cada jeito
function NumberField({
  index,
  labelSuffix,
}: {
  index: number
  labelSuffix: React.ReactNode
}) {
  const { setValue, watch } = useFormContext<NewClientFormType>()
  const name = `addresses.${index}.number` as const
  const withoutNumber = (watch(name) || '').trim().toUpperCase() === 'S/N'

  return (
    <div className="flex items-end gap-2">
      <FormInput<NewClientFormType>
        name={name}
        labelSuffix={labelSuffix}
        label="Número"
        disabled={withoutNumber}
        width="flex-1"
      />
      <div className="shrink-0 pb-[9px]">
        <CheckboxBasic
          name={`addresses-${index}-sem-numero`}
          label="S/N"
          checked={withoutNumber}
          onCheckedChange={(checked) =>
            setValue(name, checked ? 'S/N' : '', { shouldDirty: true })
          }
          className="flex items-center gap-1.5 whitespace-nowrap"
        />
      </div>
    </div>
  )
}

function ZipcodeField({ index, context }: { index: number; context: Context }) {
  const addressMark = useAddressMark(context)
  const { watch, setValue } = useFormContext<NewClientFormType>()
  const zipcode = watch(`addresses.${index}.zipcode`)

  const { data } = useCheckZipcode(zipcode?.replace(/\D/g, ''))

  useEffect(() => {
    const currentAddress = watch(`addresses.${index}`)
    if (
      currentAddress?.street &&
      currentAddress?.neighborhood &&
      currentAddress?.state
    ) {
      // Se o endereço já foi preenchido, não sobrescrever
      return
    }

    if (data) {
      setValue(`addresses.${index}.street`, data.street)
      setValue(`addresses.${index}.neighborhood`, data.neighborhood)
      setValue(`addresses.${index}.city`, data.city)
      setValue(`addresses.${index}.state`, data.state)
    }
  }, [data, index, setValue, watch])

  return (
    <FormInput<NewClientFormType>
      name={`addresses.${index}.zipcode`}
      labelSuffix={addressMark}
      label="CEP"
      placeholder="00000-000"
      additionalOnChange={(value) => {
        let zipcode = String(value).replace(/\D/g, '') // Remove tudo que não é número
        if (zipcode.length > 8) zipcode = zipcode.slice(0, 8) // Limita a 8 dígitos

        // Aplica a máscara: 00000-000
        if (zipcode.length > 5) {
          zipcode = zipcode.replace(/(\d{5})(\d{1,3})/, '$1-$2')
        }

        setValue(`addresses.${index}.zipcode`, zipcode)
      }}
      maxLength={9}
    />
  )
}
