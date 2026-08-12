'use client'

import Link from 'next/link'
import { useFormContext } from 'react-hook-form'
import { IconArrowRight, IconInfoCircle } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'

import type { EmissorData, FiscalDocType } from '../EmissorListItem'
import type { FiscalEnv } from '../../lib/fiscal-readiness'

const AMBIENTE_OPTIONS = [
  { label: 'Homologação', value: 'HOMOLOGACAO' },
  { label: 'Produção', value: 'PRODUCAO' },
]

const AMBIENTE_LABEL: Record<string, string> = {
  HOMOLOGACAO: 'homologação',
  PRODUCAO: 'produção',
}

/**
 * Seletor de ambiente da numeração + aviso do que está sendo editado.
 *
 * A numeração é por (emissor, ambiente, tipo de documento) desde a Fase 3 e é
 * de lá que a reserva atômica tira o número. Antes esta tela editava só a
 * coluna global de `invoicy_configs`, que a emissão não lê: o usuário digitava
 * o próximo número, salvava, e a nota saía com a sequência do ambiente — que
 * podia estar em 1 por causa da migration 20260803120000. Escolher o ambiente
 * aqui é o que faz o valor digitado chegar onde a emissão vai buscar.
 */
function NumeracaoPorAmbiente({
  emissor,
  docType,
  environmentField,
  seriesField,
  numberField,
}: {
  emissor?: EmissorData | null
  docType: FiscalDocType
  environmentField: string
  seriesField: string
  numberField: string
}) {
  const form = useFormContext()
  const ambiente: FiscalEnv = form.watch(environmentField) || 'HOMOLOGACAO'

  const numeracaoDe = (environment: string) =>
    emissor?.environments?.find(
      (e) => e.docType === docType && e.environment === environment,
    )

  // Trocar de ambiente troca a sequência exibida: os campos passam a mostrar
  // (e a salvar) a numeração daquele ambiente, não a do anterior.
  const handleAmbienteChange = (value: string) => {
    const linha = numeracaoDe(value)
    if (linha?.series !== undefined && linha?.series !== null) {
      form.setValue(seriesField, linha.series, { shouldDirty: false })
    }
    if (linha?.nextNumber !== undefined && linha?.nextNumber !== null) {
      form.setValue(numberField, linha.nextNumber, { shouldDirty: false })
    }
  }

  const outro = ambiente === 'PRODUCAO' ? 'HOMOLOGACAO' : 'PRODUCAO'
  const numeracaoOutro = numeracaoDe(outro)

  return (
    <div className="space-y-3">
      <FormSelect
        name={environmentField}
        label="Ambiente da numeração"
        options={AMBIENTE_OPTIONS}
        additionalOnChange={handleAmbienteChange}
      />

      <div className="flex gap-2 rounded-md border border-blue-200 bg-blue-50 p-3">
        <IconInfoCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900">
          <p>
            A série e o próximo número acima valem para{' '}
            <strong>{AMBIENTE_LABEL[ambiente]}</strong>. Cada ambiente tem
            sequência independente.
          </p>
          {numeracaoOutro?.nextNumber != null && (
            <p className="mt-1">
              Em {AMBIENTE_LABEL[outro]} a sequência atual é{' '}
              {numeracaoOutro.nextNumber}
              {numeracaoOutro.series != null ? `/${numeracaoOutro.series}` : ''}
              .
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export function NfeTab({ emissor }: { emissor?: EmissorData | null }) {
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
      <NumeracaoPorAmbiente
        emissor={emissor}
        docType="NFE"
        environmentField="nfeNumberingEnvironment"
        seriesField="serieNfe"
        numberField="proximoNumeroNfe"
      />
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

      <NumeracaoPorAmbiente
        emissor={emissor}
        docType="NFCE"
        environmentField="nfceNumberingEnvironment"
        seriesField="serieNfce"
        numberField="proximoNumeroNfce"
      />

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

export function NfseTab({ emissor }: { emissor?: EmissorData | null }) {
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

      <NumeracaoPorAmbiente
        emissor={emissor}
        docType="NFSE"
        environmentField="nfseNumberingEnvironment"
        seriesField="serieNfse"
        numberField="proximoRpsNfse"
      />

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
