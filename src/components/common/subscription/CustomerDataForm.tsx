'use client'

import { UseFormReturn } from 'react-hook-form'
import { Card } from '@/components/ui/card'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { CpfOrCnpjField } from '@/components/common/form/global-inputs/CpfOrCnpjField'
import { PersonTypeToggle } from '@/components/common/form/PersonTypeToggle'
import { SubscriptionFormData } from '@/lib/validationSchemas'
import { PersonType, StateOption, CityOption } from '@/types/subscription'
import { MaskPhoneNumber } from '@/lib/utils'

interface CustomerDataFormProps {
  form: UseFormReturn<SubscriptionFormData>
  personType: PersonType
  onPersonTypeChange: (type: PersonType) => void
  states: StateOption[]
  cities: CityOption[]
}

export function CustomerDataForm({
  form,
  personType,
  onPersonTypeChange,
  states,
  cities,
}: CustomerDataFormProps) {
  const { setValue } = form

  const stateOptions = states.map((state) => ({
    label: state.label,
    value: state.value,
  }))

  const cityOptions = cities.map((city) => ({
    label: city.label,
    value: city.value,
  }))

  return (
    <div className="mt-8">
      <Card className="bg-white p-6">
        <h3 className="font-semibold text-gray-700 mb-1">
          Dados complementares
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Informações para emissão de suas Notas Fiscais.
        </p>

        {/* Person Type Toggle */}
        <div className="mb-6">
          <PersonTypeToggle value={personType} onChange={onPersonTypeChange} />
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Company-specific fields */}
          {personType === 'company' && (
            <>
              <div>
                <FormInput
                  name="companyName"
                  label="Razão social"
                  placeholder="Nome da empresa"
                />
              </div>
              <div>
                <CpfOrCnpjField
                  name="cnpj"
                  label="CNPJ"
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </>
          )}

          {/* Common fields */}
          <div>
            <FormInput
              name="responsibleName"
              label="Nome completo do responsável"
              placeholder="Nome completo"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <CpfOrCnpjField
                name="responsibleCpf"
                label="CPF do responsável"
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <FormInput
                name="email"
                label="E-mail"
                type="email"
                placeholder="exemplo@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormInput
                name="phone"
                label="Telefone"
                placeholder="(11) 0000-0000"
                additionalOnChange={(value) => {
                  const maskedPhone = MaskPhoneNumber(
                    String(value).replace(/\D/g, ''),
                  )
                  setValue('phone', maskedPhone || '')
                }}
              />
            </div>
            <div>
              <FormInput
                name="mobile"
                label="Celular"
                placeholder="(11) 90000-0000"
                additionalOnChange={(value) => {
                  const maskedMobile = MaskPhoneNumber(
                    String(value).replace(/\D/g, ''),
                  )
                  setValue('mobile', maskedMobile || '')
                }}
              />
            </div>
          </div>

          {/* Address Section */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="font-medium text-gray-700 mb-3">Endereço</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormInput
                  name="address.zipCode"
                  label="CEP"
                  placeholder="00000-000"
                />
              </div>
              <div>
                <FormSelect
                  name="address.state"
                  label="Estado"
                  placeholder="Selecione"
                  options={stateOptions}
                  emptyMessage="Nenhum estado encontrado"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormSelect
                  name="address.city"
                  label="Cidade"
                  placeholder="Selecione"
                  options={cityOptions}
                  emptyMessage="Nenhuma cidade encontrada"
                />
              </div>
              <div>
                <FormInput
                  name="address.neighborhood"
                  label="Bairro"
                  placeholder="Nome do bairro"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormInput
                  name="address.number"
                  label="Número"
                  placeholder="123"
                />
              </div>
              <div>
                <FormInput
                  name="address.street"
                  label="Rua"
                  placeholder="Nome da rua"
                />
              </div>
            </div>

            <div>
              <FormInput
                name="address.complement"
                label="Complemento"
                placeholder="Apartamento, sala, etc. (opcional)"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
