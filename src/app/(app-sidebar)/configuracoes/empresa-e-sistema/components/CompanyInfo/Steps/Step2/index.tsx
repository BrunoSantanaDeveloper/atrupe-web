'use client'

// Component Imports
import { FormInput } from '@/components/common/form/FormInput'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Type Imports
import { CompanyFormType } from '../../schema'
import { useCheckZipcode } from '@/hooks/queries/useCheckZipcode'
import { useFormContext } from 'react-hook-form'
import { useEffect } from 'react'

const BRAZIL_STATES = [
  { value: 'AC', label: 'AC – Acre' },
  { value: 'AL', label: 'AL – Alagoas' },
  { value: 'AP', label: 'AP – Amapá' },
  { value: 'AM', label: 'AM – Amazonas' },
  { value: 'BA', label: 'BA – Bahia' },
  { value: 'CE', label: 'CE – Ceará' },
  { value: 'DF', label: 'DF – Distrito Federal' },
  { value: 'ES', label: 'ES – Espírito Santo' },
  { value: 'GO', label: 'GO – Goiás' },
  { value: 'MA', label: 'MA – Maranhão' },
  { value: 'MT', label: 'MT – Mato Grosso' },
  { value: 'MS', label: 'MS – Mato Grosso do Sul' },
  { value: 'MG', label: 'MG – Minas Gerais' },
  { value: 'PA', label: 'PA – Pará' },
  { value: 'PB', label: 'PB – Paraíba' },
  { value: 'PR', label: 'PR – Paraná' },
  { value: 'PE', label: 'PE – Pernambuco' },
  { value: 'PI', label: 'PI – Piauí' },
  { value: 'RJ', label: 'RJ – Rio de Janeiro' },
  { value: 'RN', label: 'RN – Rio Grande do Norte' },
  { value: 'RS', label: 'RS – Rio Grande do Sul' },
  { value: 'RO', label: 'RO – Rondônia' },
  { value: 'RR', label: 'RR – Roraima' },
  { value: 'SC', label: 'SC – Santa Catarina' },
  { value: 'SP', label: 'SP – São Paulo' },
  { value: 'SE', label: 'SE – Sergipe' },
  { value: 'TO', label: 'TO – Tocantins' },
]

export function Step2() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="mt-auto col-span-2">
        <ZipcodeField />
      </div>
      <div className="mt-auto col-span-2">
        <StateSelectField />
      </div>
      <div className="col-span-full flex gap-4 items-baseline">
        <FormInput<CompanyFormType> name={`address.city`} label="Cidade" />
        <FormInput<CompanyFormType>
          name={`address.neighborhood`}
          label="Bairro"
        />
      </div>
      <FormInput<CompanyFormType> name={`address.number`} label="Número" />
      <div className="col-span-3">
        <FormInput<CompanyFormType> name={`address.street`} label="Rua" />
      </div>
      <div className="col-span-full">
        <FormInput<CompanyFormType>
          name={`address.complement`}
          label="Complemento"
        />
      </div>
    </div>
  )
}

function StateSelectField() {
  const { control } = useFormContext<CompanyFormType>()

  return (
    <FormField
      control={control}
      name="address.state"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Estado</FormLabel>
          <Select onValueChange={field.onChange} value={field.value ?? ''}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {BRAZIL_STATES.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function ZipcodeField() {
  const { watch, setValue, trigger } = useFormContext<CompanyFormType>()
  const zipcode = watch(`address.zipcode`)

  const { data } = useCheckZipcode(zipcode?.replace(/\D/g, ''))

  useEffect(() => {
    if (data) {
      setValue(`address.street`, data.street)
      setValue(`address.neighborhood`, data.neighborhood)
      setValue(`address.city`, data.city)
      setValue(`address.state`, data.state)
      trigger(`address`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, setValue])

  return (
    <FormInput<CompanyFormType>
      name={`address.zipcode`}
      label="CEP"
      placeholder="00000-000"
      additionalOnChange={(value) => {
        let zipcode = String(value).replace(/\D/g, '') // Remove tudo que não é número
        if (zipcode.length > 8) zipcode = zipcode.slice(0, 8) // Limita a 8 dígitos

        // Aplica a máscara: 00000-000
        if (zipcode.length > 5) {
          zipcode = zipcode.replace(/(\d{5})(\d{1,3})/, '$1-$2')
        }

        setValue(`address.zipcode`, zipcode)
      }}
      maxLength={9}
    />
  )
}
