'use client'

import { useController, useFormContext } from 'react-hook-form'

import { FormCheckbox } from '@/components/common/form/FormCheckbox'
import { FormInput } from '@/components/common/form/FormInput'
import { Spinner } from '@/components/ui/spinner'
import { cn, maskCnpj, maskCpf } from '@/lib/utils'
import type { CompanyRegistryView } from '@/types/checkout'

import {
  AccountStatus,
  CheckoutSection,
  ChoiceCard,
  GroupTitle,
  SectionNote,
} from '../../components/checkout/CheckoutLayout'
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
  account: { name: string; email: string }
  registry: RegistryState
  representative: RepresentativeState
  onCnpjChange: (masked: string) => void
  onRepresentativeCpfChange: (masked: string) => void
}

/** Aviso sob um campo: consultando (neutro), certo (marca) ou problema (erro). */
function FieldNotice({
  tone,
  children,
}: {
  tone: 'loading' | 'ok' | 'error'
  children: React.ReactNode
}) {
  return (
    <p
      className={cn(
        '-mt-2 flex items-center gap-2 text-xs leading-[1.4]',
        tone === 'ok' && 'text-brand-600',
        tone === 'error' && 'text-error-700',
        tone === 'loading' && 'text-gray-500',
      )}
      role={tone === 'error' ? 'alert' : undefined}
    >
      {tone === 'loading' && <Spinner classname="mr-0 size-3.5" />}
      <span>{children}</span>
    </p>
  )
}

/**
 * Etapa 2 — quem contrata, no desenho do protótipo.
 *
 * A conta conectada aparece antes de tudo, com a nota de que a titularidade
 * pode ser transferida depois. Empresa vem primeiro: o CNPJ é confirmado pela
 * consulta pública assim que fica válido — razão social e nome fantasia só
 * viram campo quando a consulta falha — e o CPF de quem responde pela empresa
 * é conferido contra o quadro societário, que nunca é exibido.
 */
export function ContractorStep({
  account,
  registry,
  representative,
  onCnpjChange,
  onRepresentativeCpfChange,
}: Props) {
  const { control, setValue } = useFormContext<ContractingForm>()
  const { field: personType } = useController({ control, name: 'personType' })

  const company = registry.status === 'found' ? registry.data : null
  const inactiveCompany = company && company.isActive === false

  return (
    <CheckoutSection title="Quem contrata" id="section-contratante">
      <SectionNote>
        A titularidade poderá ser transferida posteriormente.
      </SectionNote>
      <AccountStatus name={account.name} email={account.email} />

      <div className="flex flex-col gap-2.5">
        <GroupTitle>Contratante</GroupTitle>
        <div
          className="flex flex-col gap-3"
          role="radiogroup"
          aria-label="Tipo de contratante"
        >
          <ChoiceCard
            name="personType"
            value="PJ"
            checked={personType.value === 'PJ'}
            onSelect={(value) => personType.onChange(value)}
            title="Empresa (CNPJ)"
          >
            <FormInput<ContractingForm>
              name="cnpj"
              label="CNPJ"
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
              <FieldNotice tone="loading">
                Consultando os dados da empresa…
              </FieldNotice>
            )}
            {registry.status === 'manual' && (
              <FieldNotice tone="error">{registry.message}</FieldNotice>
            )}
            {inactiveCompany && (
              <FieldNotice tone="error">
                Situação cadastral: {company.registrationStatus}. Confira os
                dados antes de continuar.
              </FieldNotice>
            )}

            {company && (
              <dl className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3.5">
                <div>
                  <dt className="mb-0.5 text-xs text-gray-500">
                    {company.tradeName ? 'Nome fantasia' : 'Razão social'}
                  </dt>
                  <dd className="text-sm font-semibold leading-[1.4] text-gray-900">
                    {company.tradeName || company.legalName}
                  </dd>
                </div>
              </dl>
            )}

            {registry.status === 'manual' && (
              <>
                <FormInput<ContractingForm>
                  name="legalName"
                  label="Razão social"
                  placeholder="Digite aqui"
                  width="w-full"
                />
                <FormInput<ContractingForm>
                  name="tradeName"
                  label="Nome fantasia"
                  placeholder="Digite aqui"
                  width="w-full"
                />
              </>
            )}

            <FormInput<ContractingForm>
              name="email"
              type="email"
              label="E-mail corporativo"
              placeholder="contato@empresa.com.br"
              autoComplete="email"
              width="w-full"
            />

            <div className="flex flex-col gap-3 border-t border-gray-200 pt-5">
              <FormInput<ContractingForm>
                name="representativeCpf"
                label="CPF de um representante legal"
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
                <FieldNotice tone="loading">
                  Conferindo no registro público…
                </FieldNotice>
              )}
              {representative.status === 'verified' && (
                <FieldNotice tone="ok">
                  Representante legal confirmado no registro:{' '}
                  {representative.name}.
                </FieldNotice>
              )}
              {representative.status === 'rejected' && (
                <FieldNotice tone="error">{representative.message}</FieldNotice>
              )}
              {representative.status === 'unverifiable' && (
                <>
                  <FieldNotice tone="ok">
                    Não foi possível conferir no registro público. O CPF será
                    registrado como informado.
                  </FieldNotice>
                  <FormInput<ContractingForm>
                    name="representativeName"
                    label="Nome do representante legal"
                    placeholder="Digite aqui"
                    width="w-full"
                  />
                </>
              )}
              <FormCheckbox<ContractingForm>
                name="representativeIsSelf"
                label="Sou eu quem responde pela empresa"
              />
            </div>
          </ChoiceCard>

          <ChoiceCard
            name="personType"
            value="PF"
            checked={personType.value === 'PF'}
            onSelect={(value) => personType.onChange(value)}
            title="Pessoa física (CPF)"
          >
            <FormInput<ContractingForm>
              name="name"
              label="Nome completo"
              placeholder="Digite aqui"
              autoComplete="name"
              width="w-full"
            />
            <FormInput<ContractingForm>
              name="cpf"
              label="CPF"
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
              label="E-mail"
              placeholder="voce@email.com"
              autoComplete="email"
              width="w-full"
            />
          </ChoiceCard>
        </div>
      </div>
    </CheckoutSection>
  )
}
