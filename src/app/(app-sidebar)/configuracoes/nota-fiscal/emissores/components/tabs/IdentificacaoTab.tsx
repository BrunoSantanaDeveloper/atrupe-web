'use client'

import Link from 'next/link'
import { IconArrowRight, IconBuilding } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormSwitch } from '@/components/common/form/FormSwitch'

import type { EmissorData } from '../EmissorListItem'

// Regime Normal e MEI ficam visíveis mas bloqueados: a emissão monta a nota
// com base de cálculo e imposto zerados, o que está correto para o Simples
// Nacional e produziria documento subdeclarado nos demais regimes. Esconder a
// opção só faria o usuário procurar; o rótulo explica por que não dá para
// selecionar. Liberar junto com o cálculo de imposto por item.
const crtOptions = [
  { value: '1', label: '1 - Simples Nacional' },
  { value: '2', label: '2 - Simples Nacional - Excesso de sublimite' },
  {
    value: '3',
    label: '3 - Regime Normal (em desenvolvimento)',
    disabled: true,
  },
  { value: '4', label: '4 - MEI (em desenvolvimento)', disabled: true },
]

function ReadOnlyField({
  label,
  value,
}: {
  label: string
  value?: string | null
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className="text-sm font-medium text-gray-900">{value || '—'}</p>
    </div>
  )
}

interface Props {
  emissor?: EmissorData | null
  isEditing: boolean
}

export function IdentificacaoTab({ emissor, isEditing }: Props) {
  const company = emissor?.company
  const address = company?.address

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <FormInput
          name="name"
          label="Nome Identificador (Ex: Matriz) *"
          placeholder="Ex: Matriz, Filial SP"
        />

        <FormSelect
          name="emitCrt"
          label="Código de Regime Tributário"
          options={crtOptions}
        />
        <p className="text-xs text-muted-foreground -mt-2">
          Lucro Real, Lucro Presumido e MEI ainda não são suportados: o cálculo
          de ICMS, PIS, COFINS e IPI por item não está implementado.
        </p>

        <div>
          <FormInput
            name="defaultNcm"
            label="NCM padrão para novos produtos"
            placeholder="Ex: 49119900"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Aplicado ao cadastrar produtos novos. Não altera produtos existentes
            nem substitui o NCM informado na nota.
          </p>
        </div>

        {isEditing && (
          <div>
            <FormSwitch name="isActive" label="Emissor ativo" />
            <p className="text-xs text-muted-foreground mt-1">
              Emissores inativos não podem ser usados em novas emissões.
            </p>
          </div>
        )}
      </div>

      {/*
        Dados cadastrais pertencem a Company, não ao emissor. Exibidos aqui em
        somente-leitura para dar contexto sem duplicar a fonte da verdade.
      */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <IconBuilding className="h-4 w-4 text-gray-500" />
            <h4 className="text-sm font-semibold text-gray-900">
              Dados cadastrais da empresa
            </h4>
          </div>
          <Button
            type="button"
            variant="neutralOutline"
            size="sm"
            RightIcon={IconArrowRight}
            asChild
          >
            <Link href="/configuracoes/empresa-e-sistema">Editar</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ReadOnlyField label="CNPJ" value={company?.cnpj} />
          <ReadOnlyField label="Razão social" value={company?.legalName} />
          <ReadOnlyField
            label="Inscrição estadual"
            value={company?.stateRegistration}
          />
          <ReadOnlyField
            label="Inscrição municipal"
            value={company?.municipalRegistration}
          />
          <ReadOnlyField
            label="Município (código IBGE)"
            value={emissor?.ibgeCode}
          />
          <ReadOnlyField label="UF" value={address?.state} />
        </div>

        <p className="text-xs text-muted-foreground">
          O código IBGE é derivado do CEP do endereço principal e usado no XML
          como município do emitente.
        </p>
      </div>
    </div>
  )
}
