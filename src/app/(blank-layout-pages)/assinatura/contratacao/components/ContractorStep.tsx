'use client'

import { useFormContext, useWatch } from 'react-hook-form'
import {
  IconAlertTriangle,
  IconBuilding,
  IconCircleCheck,
  IconUser,
} from '@tabler/icons-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormCheckbox } from '@/components/common/form/FormCheckbox'
import { FormInput } from '@/components/common/form/FormInput'
import { FormToggleCard } from '@/components/common/form/FormToggleCard'
import { Spinner } from '@/components/ui/spinner'
import { maskCnpj, maskCpf } from '@/lib/utils'
import type { CompanyRegistryView } from '@/types/checkout'
import type { ContractingForm } from './schema'

export type RegistryState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'found'; data: CompanyRegistryView }
  | { status: 'manual'; message: string }

export type RepresentativeState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'verified'; name: string; qualification?: string }
  | { status: 'unverifiable' }
  | { status: 'rejected'; message: string }

interface Props {
  signedInAs: string
  registry: RegistryState
  representative: RepresentativeState
  onCnpjChange: (masked: string) => void
  onRepresentativeCpfChange: (masked: string) => void
}

const PERSON_TYPES = [
  {
    value: 'PJ',
    label: 'Empresa',
    description: 'Contratação com CNPJ',
    icon: IconBuilding,
  },
  {
    value: 'PF',
    label: 'Pessoa física',
    description: 'Contratação com CPF',
    icon: IconUser,
  },
]

/**
 * Etapa 2 — quem contrata.
 *
 * Empresa vem primeiro: o CNPJ é confirmado pela consulta pública assim que
 * fica válido, e o CPF de quem responde pela empresa é conferido contra o
 * quadro societário. O quadro nunca é exibido: a pergunta é quem responde
 * pela empresa, não "escolha um nome desta lista".
 */
export function ContractorStep({
  signedInAs,
  registry,
  representative,
  onCnpjChange,
  onRepresentativeCpfChange,
}: Props) {
  const { setValue } = useFormContext<ContractingForm>()
  const personType = useWatch<ContractingForm, 'personType'>({
    name: 'personType',
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quem contrata</CardTitle>
        <p className="text-sm text-gray-600">
          Conectado como <strong>{signedInAs}</strong>. A titularidade poderá
          ser transferida posteriormente.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <FormToggleCard name="personType" options={PERSON_TYPES} />

        {personType === 'PJ' ? (
          <div className="space-y-5">
            <FormInput<ContractingForm>
              name="cnpj"
              label="CNPJ *"
              inputMode="numeric"
              placeholder="00.000.000/0000-00"
              maxLength={18}
              width="w-full"
              additionalOnChange={(value) => {
                const masked = maskCnpj(String(value ?? '')) || ''
                setValue('cnpj', masked, { shouldValidate: false })
                onCnpjChange(masked)
              }}
            />

            {registry.status === 'loading' && (
              <p className="flex items-center gap-2 text-sm text-gray-600">
                <Spinner /> Consultando os dados da empresa…
              </p>
            )}

            {registry.status === 'found' && (
              <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm space-y-1">
                <p className="font-medium text-gray-800">
                  {registry.data.legalName}
                </p>
                <p className="text-gray-600">
                  Nome fantasia:{' '}
                  {registry.data.tradeName || registry.data.legalName}
                </p>
                {registry.data.isActive === false && (
                  <p className="flex items-center gap-1 text-warning-700">
                    <IconAlertTriangle size={16} /> Situação cadastral:{' '}
                    {registry.data.registrationStatus}
                  </p>
                )}
              </div>
            )}

            {registry.status === 'manual' && (
              <div className="space-y-4">
                <Alert
                  variant="warning"
                  className="border-warning-200 bg-warning-50"
                >
                  <AlertDescription className="text-warning-700">
                    {registry.message}
                  </AlertDescription>
                </Alert>
                <FormInput<ContractingForm>
                  name="legalName"
                  label="Razão social *"
                  width="w-full"
                />
                <FormInput<ContractingForm>
                  name="tradeName"
                  label="Nome fantasia"
                  width="w-full"
                />
              </div>
            )}

            <FormInput<ContractingForm>
              name="email"
              type="email"
              label="E-mail corporativo *"
              width="w-full"
            />

            <div className="space-y-3 rounded-md border border-gray-200 p-4">
              <div>
                <p className="font-medium text-gray-800">Representante legal</p>
                <p className="text-sm text-gray-600">
                  O CPF de quem responde legalmente pela empresa. Pode ser o
                  seu.
                </p>
              </div>

              <FormCheckbox<ContractingForm>
                name="representativeIsSelf"
                label="Sou eu quem responde pela empresa"
              />

              <FormInput<ContractingForm>
                name="representativeCpf"
                label="CPF do representante legal *"
                inputMode="numeric"
                placeholder="000.000.000-00"
                maxLength={14}
                width="w-full"
                additionalOnChange={(value) => {
                  const masked = maskCpf(String(value ?? '')) || ''
                  setValue('representativeCpf', masked, {
                    shouldValidate: false,
                  })
                  onRepresentativeCpfChange(masked)
                }}
              />

              {representative.status === 'checking' && (
                <p className="flex items-center gap-2 text-sm text-gray-600">
                  <Spinner /> Conferindo no registro público…
                </p>
              )}
              {representative.status === 'verified' && (
                <p className="flex items-center gap-2 text-sm text-brand-700">
                  <IconCircleCheck size={18} /> Conferido no registro público:{' '}
                  {representative.name}
                  {representative.qualification
                    ? ` (${representative.qualification})`
                    : ''}
                </p>
              )}
              {representative.status === 'rejected' && (
                <p className="text-sm text-error-600" role="alert">
                  {representative.message}
                </p>
              )}
              {representative.status === 'unverifiable' && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    O registro público desta empresa não permite conferir o CPF.
                    Informe o nome de quem responde por ela.
                  </p>
                  <FormInput<ContractingForm>
                    name="representativeName"
                    label="Nome do representante legal *"
                    width="w-full"
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <FormInput<ContractingForm>
              name="name"
              label="Nome completo *"
              width="w-full"
            />
            <FormInput<ContractingForm>
              name="cpf"
              label="CPF *"
              inputMode="numeric"
              placeholder="000.000.000-00"
              maxLength={14}
              width="w-full"
              additionalOnChange={(value) =>
                setValue('cpf', maskCpf(String(value ?? '')) || '', {
                  shouldValidate: false,
                })
              }
            />
            <FormInput<ContractingForm>
              name="email"
              type="email"
              label="E-mail *"
              width="w-full"
            />
          </div>
        )}

        <p className="text-xs text-gray-500">
          Campos com * são obrigatórios. A nota fiscal sai em nome de quem
          contrata.
        </p>
      </CardContent>
    </Card>
  )
}
