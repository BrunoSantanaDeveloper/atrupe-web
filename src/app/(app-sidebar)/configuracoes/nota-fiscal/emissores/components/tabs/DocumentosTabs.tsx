'use client'

import Link from 'next/link'
import { useFormContext } from 'react-hook-form'
import {
  IconArrowRight,
  IconInfoCircle,
  IconListDetails,
} from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { ListaServicosManagerDialog } from '@/components/common/fiscal/ListaServicosNfse'
import { useState } from 'react'

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

// Lista completa do InvoiCy, que converte para o regEspTrib do layout nacional.
// De 1 a 6 é a enumeração ABRASF, válida em qualquer município; de 7 a 16 são
// valores que só existem no provedor da prefeitura indicado entre parênteses —
// enviar um valor de provedor errado faz a nota ser recusada.
// "Não informar" omite a tag. Usa sentinela em vez de string vazia: o Select do
// Radix reserva '' para limpar a seleção e lança se um item declarar esse valor.
const REGIME_ESPECIAL_TRIBUTACAO_OPTIONS = [
  { label: 'Não informar', value: 'none' },
  { label: '1 — Microempresa municipal', value: '1' },
  { label: '2 — Estimativa', value: '2' },
  { label: '3 — Sociedade de profissionais', value: '3' },
  { label: '4 — Cooperativa', value: '4' },
  { label: '5 — Microempresário Individual (MEI)', value: '5' },
  {
    label: '6 — Microempresário e Empresa de Pequeno Porte (ME EPP)',
    value: '6',
  },
  {
    label: '7 — Optante pelo Simples Nacional (Elotech e GLC Consultoria 2.0)',
    value: '7',
  },
  { label: '8 — Tributação Normal (E&L)', value: '8' },
  { label: '9 — Autônomo (E&L)', value: '9' },
  { label: '10 — Variável (GLC Consultoria 2.0)', value: '10' },
  { label: '11 — Lucro Real (Digifred)', value: '11' },
  { label: '12 — Lucro Presumido (Digifred)', value: '12' },
  {
    label: '13 — Sociedade de Profissionais Pessoa Jurídica (SEMFAZ)',
    value: '13',
  },
  { label: '14 — Não (NF-Eletrônica)', value: '14' },
  { label: '15 — Notas Totalizadoras (NF-Eletrônica)', value: '15' },
  { label: '16 — Inscrito no PRODEVAL (NF-Eletrônica)', value: '16' },
]

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

      <div>
        <FormInput
          name="prazoCancelamentoNfeHoras"
          label="Prazo para tentar o cancelamento (horas)"
          type="number"
          placeholder="Teto nacional"
        />
        <p className="text-xs text-muted-foreground mt-1">
          O prazo regular é de 24 horas, contado da autorização. Passado ele,
          vários estados ainda aceitam o cancelamento com penalidade — São
          Paulo, por exemplo, recebe até 480 horas. Este campo é só o limite
          para o sistema deixar tentar; quem decide é a SEFAZ do seu estado. Em
          branco, o sistema não bloqueia antes do teto nacional.
        </p>
      </div>
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

/**
 * A NFS-e nacional monta o Id do DPS a partir da série e o valida contra
 * TSSerieDPS — `[0-9]{1,4}|[0-8][0-9]{4}`, ou seja, numérica de 1 a 89999.
 * Municípios em layout próprio ainda aceitam série alfanumérica (há notas
 * autorizadas com "A1"), então o campo segue livre e o aviso é informativo.
 */
const SERIE_NFSE_NACIONAL = /^(?:[0-9]{1,4}|[0-8][0-9]{4})$/

export function NfseTab({ emissor }: { emissor?: EmissorData | null }) {
  const { watch } = useFormContext()
  const serie = String(watch('serieNfse') ?? '')
  const serieForaDoPadraoNacional = !!serie && !SERIE_NFSE_NACIONAL.test(serie)

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 pb-2 border-b border-gray-100">
        Nota Fiscal de Serviços (NFS-e)
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormInput name="serieNfse" label="Série" placeholder="Ex: 1" />
        <FormInput name="proximoRpsNfse" label="Próximo RPS" type="number" />
        <FormInput
          name="aliquotaIss"
          label="Alíquota ISS (%)"
          type="number"
          step="0.01"
        />
      </div>

      {serieForaDoPadraoNacional && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          A série <strong>{serie}</strong> não é aceita pelo padrão nacional da
          NFS-e, que exige série numérica de 1 a 89999. Municípios em layout
          próprio ainda a aceitam; nos demais a prefeitura rejeita com
          &ldquo;Falha no esquema XML do DF-e&rdquo; (E1235). Trocar a série
          inicia uma nova sequência de numeração.
        </div>
      )}

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

      <ListaServicosNfseBloco />

      <div>
        <FormSelect
          name="regimeEspecialTributacao"
          label="Regime Especial de Tributação"
          options={REGIME_ESPECIAL_TRIBUTACAO_OPTIONS}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Alguns municípios exigem este campo e outros recusam a nota se ele for
          enviado. Deixe em branco para omiti-lo. Sem preenchimento, empresas do
          Simples Nacional usam ME/EPP.
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

/**
 * Bloco de acesso à Lista de Serviços da empresa (aba NFS-e do emissor).
 * A lista alimenta o seletor "Lista de Serviços" nas telas de emissão.
 */
function ListaServicosNfseBloco() {
  const [aberto, setAberto] = useState(false)

  return (
    <div className="rounded-lg border border-gray-200 p-4 flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-gray-700">Lista de Serviços</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Cadastre os serviços da empresa (código LC 116, alíquota e
          classificação fiscal) para escolher qual usar no ato da emissão.
        </p>
      </div>
      <Button
        type="button"
        variant="neutralOutline"
        onClick={() => setAberto(true)}
        RightIcon={IconListDetails}
      >
        Gerenciar
      </Button>
      <ListaServicosManagerDialog open={aberto} onOpenChange={setAberto} />
    </div>
  )
}
