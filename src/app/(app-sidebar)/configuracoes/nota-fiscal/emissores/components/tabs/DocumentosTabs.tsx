'use client'

import Link from 'next/link'
import { IconArrowRight, IconInfoCircle } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/common/form/FormInput'

import type { EmissorData } from '../EmissorListItem'

/**
 * Aviso reutilizado nas abas de numeração.
 *
 * A numeração passou a ser por (emissor, ambiente, tipo de documento) na
 * Fase 3. Os campos abaixo alimentam a sequência do ambiente de HOMOLOGAÇÃO;
 * produção tem sequência independente, ajustada no assistente de ativação.
 */
function NumeracaoHint() {
  return (
    <div className="flex gap-2 rounded-md border border-blue-200 bg-blue-50 p-3">
      <IconInfoCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
      <p className="text-xs text-blue-900">
        Homologação e produção têm sequências independentes. Estes campos
        ajustam a numeração do ambiente de homologação.
      </p>
    </div>
  )
}

export function NfeTab() {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 pb-2 border-b border-gray-100">
        Nota Fiscal Eletrônica (NF-e)
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          name="serieNfe"
          label="Série"
          type="number"
          placeholder="1"
        />
        <FormInput
          name="proximoNumeroNfe"
          label="Próximo Número"
          type="number"
          placeholder="1"
        />
      </div>
      <NumeracaoHint />
    </div>
  )
}

export function NfceTab({ emissor }: { emissor?: EmissorData | null }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 pb-2 border-b border-gray-100">
        Nota Fiscal de Consumidor (NFC-e)
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          name="serieNfce"
          label="Série"
          type="number"
          placeholder="1"
        />
        <FormInput
          name="proximoNumeroNfce"
          label="Próximo Número"
          type="number"
          placeholder="1"
        />
      </div>

      <NumeracaoHint />

      <div>
        <FormInput
          name="prazoCancelamentoNfce"
          label="Prazo de cancelamento (minutos)"
          type="number"
          placeholder="30"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Definido pela legislação da UF. Consulte a SEFAZ do seu estado antes
          de alterar.
        </p>
      </div>

      <div className="rounded-md border border-dashed border-gray-200 bg-white p-3">
        <p className="text-xs text-gray-600">
          CSC:{' '}
          <span className="font-medium">
            {emissor?.cscConfigured ? 'Configurado' : 'Não configurado'}
          </span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          O ID e o token do CSC são configurados por ambiente no assistente de
          ativação.
        </p>
      </div>
    </div>
  )
}

export function NfseTab() {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 pb-2 border-b border-gray-100">
        Nota Fiscal de Serviços (NFS-e)
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormInput name="serieNfse" label="Série" placeholder="Ex: A1" />
        <FormInput name="proximoRpsNfse" label="Próximo RPS" type="number" />
        <FormInput
          name="aliquotaIss"
          label="Alíquota ISS (%)"
          type="number"
          step="0.01"
        />
      </div>

      <NumeracaoHint />

      <div>
        <FormInput
          name="codigoServico"
          label="Código de Serviço Padrão (LC 116)"
          placeholder="Ex: 17.06"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Conforme Lei Complementar 116/2003. Usado apenas quando o produto não
          define um código próprio.
        </p>
      </div>
    </div>
  )
}

export function PadroesTab() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 pb-2 border-b border-gray-100">
          Padrões de Operação
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="defaultCfop"
            label="CFOP Padrão"
            placeholder="Ex: 5102"
          />
          <FormInput
            name="defaultOperationNature"
            label="Natureza de Operação Padrão"
            placeholder="Ex: Venda de mercadorias"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Usados como sugestão inicial no formulário de emissão. O CFOP efetivo
          de cada item continua sendo resolvido por produto, UF de destino e
          finalidade da nota.
        </p>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="text-xs text-gray-700">
            O catálogo de CFOPs e naturezas de operação é mantido em tela
            própria.
          </p>
          <Button
            type="button"
            variant="neutralOutline"
            size="sm"
            RightIcon={IconArrowRight}
            asChild
          >
            <Link href="/configuracoes/nota-fiscal/cfop">Abrir catálogo</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
