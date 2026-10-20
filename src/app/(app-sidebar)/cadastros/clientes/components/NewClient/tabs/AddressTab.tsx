import { useFormContext, useFieldArray } from 'react-hook-form'
import { FormInput } from '@/components/common/form/FormInput'
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

export function AddressTab() {
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
              {!isForeign ? <ZipcodeField index={index} /> : <div></div>}
              <div className="mt-auto">
                <FormInput<NewClientFormType>
                  name={`addresses.${index}.state`}
                  label="Estado"
                  disabled={isForeign}
                />
              </div>
              <div className="col-span-full flex gap-4 items-baseline">
                <FormInput<NewClientFormType>
                  name={`addresses.${index}.city`}
                  label="Cidade"
                  disabled={isForeign}
                />
                {!isForeign ? (
                  <FormInput<NewClientFormType>
                    name={`addresses.${index}.neighborhood`}
                    label="Bairro"
                  />
                ) : (
                  <div></div>
                )}
              </div>
              <FormInput<NewClientFormType>
                name={`addresses.${index}.number`}
                inputMode="numeric"
                label="Número"
              />
              <div className="col-span-2">
                <FormInput<NewClientFormType>
                  name={`addresses.${index}.street`}
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
function ZipcodeField({ index }: { index: number }) {
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
