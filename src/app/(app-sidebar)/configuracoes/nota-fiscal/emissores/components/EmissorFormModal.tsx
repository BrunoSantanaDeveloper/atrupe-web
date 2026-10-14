// React
import { useState, useEffect, useMemo } from 'react'

// UI
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Icons
import { IconDeviceFloppy } from '@tabler/icons-react'

// Form
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { EmissorData } from './EmissorListItem'

// Tabs
import { IdentificacaoTab } from './tabs/IdentificacaoTab'
import { CertificadoTab } from './tabs/CertificadoTab'
import { NfeTab, NfceTab, NfseTab, PadroesTab } from './tabs/DocumentosTabs'
import { EnvioTab } from './tabs/EnvioTab'
import { ReformaTab } from './tabs/ReformaTab'

/**
 * Percentual opcional onde vazio significa "usar o padrão", nao zero.
 *
 * `z.coerce.number()` converte '' em 0 — numa aliquota isso gravaria 0% e o
 * calculo deixaria de cair no padrao nacional, zerando o tributo em silencio.
 */
const percentualOpcional = z.preprocess(
  (v) => (v === '' || v === null ? undefined : v),
  z.coerce.number().min(0).max(100).optional(),
)

/**
 * Inteiro opcional em que vazio significa "usar o padrao do sistema", nao 0.
 * Mesma armadilha do percentual: `z.coerce.number()` transforma '' em 0, e um
 * prazo de cancelamento 0 bloquearia todo cancelamento.
 */
const inteiroOpcional = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === '' || v === null ? undefined : v),
    z.coerce.number().int().min(min).max(max).optional(),
  )

const emissoresSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),

  // Identificação
  emitCrt: z.string().optional(),
  ie: z.string().optional(),
  im: z.string().optional(),

  // Padrões de produto e NFC-e
  defaultNcm: z.string().optional(),
  prazoCancelamentoNfce: z.coerce.number().min(1).max(1440).optional(),
  // Vazio = sem limite proprio; o backend usa o teto nacional.
  prazoCancelamentoNfeHoras: inteiroOpcional(1, 1440),

  // Fiscal Configs
  serieNfe: z.coerce.number().optional(),
  proximoNumeroNfe: z.coerce.number().optional(),
  serieNfse: z.string().optional(),
  proximoRpsNfse: z.coerce.number().optional(),
  codigoServico: z.string().optional(),
  aliquotaIss: z.coerce.number().optional(),
  // 'none' significa "não informar": o campo é omitido do payload.
  regimeEspecialTributacao: z.string().optional(),
  serieNfce: z.coerce.number().optional(),
  proximoNumeroNfce: z.coerce.number().optional(),
  defaultCfop: z.string().optional(),
  defaultOperationNature: z.string().optional(),

  // Reforma Tributária
  reformaTributariaAtiva: z.boolean().optional(),
  ibsCbsEnviarValores: z.boolean().optional(),
  // 'none' significa "não informar", como em regimeEspecialTributacao.
  regApIbsCbsSn: z.string().optional(),
  aliquotaIbsUf: percentualOpcional,
  aliquotaIbsMun: percentualOpcional,
  aliquotaCbs: percentualOpcional,
  indicadorOperacaoNfse: z.string().max(6).optional(),

  // Ambiente a que a numeração acima se aplica. Homologação e produção têm
  // sequências independentes; sem isto o PATCH gravava só a coluna global e o
  // número digitado não chegava ao ambiente que a emissão consulta.
  nfeNumberingEnvironment: z.enum(['HOMOLOGACAO', 'PRODUCAO']).optional(),
  nfceNumberingEnvironment: z.enum(['HOMOLOGACAO', 'PRODUCAO']).optional(),
  nfseNumberingEnvironment: z.enum(['HOMOLOGACAO', 'PRODUCAO']).optional(),

  // Informações complementares e envio
  taxInfoText: z.string().optional(),
  sendDanfeXmlAutomatically: z.boolean().optional(),
  sendDanfeAutomatically: z.boolean().optional(),
  sendXmlAutomatically: z.boolean().optional(),
  sendFiscalEmailCopyTo: z
    .string()
    .email('E-mail inválido')
    .optional()
    .or(z.literal('')),
})

export type EmissorFormValues = z.infer<typeof emissoresSchema>

/**
 * Garante que o PATCH comum nunca altere ambiente ou credenciais sensíveis.
 * Ambiente ATIVO muda apenas via `activate`; CSC via `/environments/:env/csc`.
 *
 * Os campos `<doc>NumberingEnvironment` seguem no payload de propósito: eles
 * não trocam o ambiente ativo, só dizem a qual sequência a numeração informada
 * pertence.
 */
const sanitizeEmissorPayload = (data: EmissorFormValues) => {
  const safe: Record<string, unknown> = { ...data }
  delete safe.environment
  delete safe.ambiente
  delete safe.cscId
  delete safe.cscToken
  // ie/im pertencem à Company (stateRegistration/municipalRegistration),
  // não ao InvoicyConfig — o endpoint de emissor rejeita esses campos.
  delete safe.ie
  delete safe.im

  // Regime especial vazio significa "não informar": vai como null para limpar
  // um valor salvo antes, e como número quando preenchido.
  safe.regimeEspecialTributacao =
    data.regimeEspecialTributacao && data.regimeEspecialTributacao !== 'none'
      ? Number(data.regimeEspecialTributacao)
      : null

  // Mesmo tratamento do regime especial: vazio limpa o que estava salvo.
  safe.regApIbsCbsSn =
    data.regApIbsCbsSn && data.regApIbsCbsSn !== 'none'
      ? Number(data.regApIbsCbsSn)
      : null

  return safe as EmissorFormValues
}

export type EditType = 'GLOBAL' | 'NFE' | 'NFSE' | 'NFCE'

type TabKey =
  | 'identificacao'
  | 'certificado'
  | 'nfe'
  | 'nfce'
  | 'nfse'
  | 'padroes'
  | 'reforma'
  | 'envio'

interface EmissorFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  emissor?: EmissorData | null
  editType?: EditType
  /** Aba aberta ao montar. Usada por quem manda o usuário resolver algo
   *  específico — por exemplo o wizard de ativação apontando o certificado. */
  initialTab?: TabKey
  onSave: (data: EmissorFormValues) => Promise<void>
}

export function EmissorFormModal({
  open,
  onOpenChange,
  emissor,
  editType = 'GLOBAL',
  initialTab,
  onSave,
}: EmissorFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!emissor?.id

  const form = useForm<EmissorFormValues>({
    resolver: zodResolver(emissoresSchema),
    defaultValues: {
      name: '',
      isDefault: false,
      isActive: true,
      emitCrt: '1',
      defaultNcm: '',
      prazoCancelamentoNfce: 30,
      prazoCancelamentoNfeHoras: undefined,
      serieNfe: 1,
      proximoNumeroNfe: 1,
      serieNfse: '1',
      proximoRpsNfse: 1,
      regimeEspecialTributacao: 'none',
      reformaTributariaAtiva: false,
      ibsCbsEnviarValores: false,
      regApIbsCbsSn: 'none',
      indicadorOperacaoNfse: '',
      serieNfce: 1,
      proximoNumeroNfce: 1,
      nfeNumberingEnvironment: 'HOMOLOGACAO',
      nfceNumberingEnvironment: 'HOMOLOGACAO',
      nfseNumberingEnvironment: 'HOMOLOGACAO',
      taxInfoText: '',
      sendDanfeXmlAutomatically: false,
      sendDanfeAutomatically: true,
      sendXmlAutomatically: true,
      sendFiscalEmailCopyTo: '',
    },
  })

  // Quais abas aparecem. Quando o usuário abre o modal a partir de um tipo de
  // documento específico (editType), mostra só o que interessa àquele tipo —
  // o mesmo comportamento condicional de antes, agora expresso como abas.
  const tabs = useMemo(() => {
    const all: { key: TabKey; label: string }[] = [
      { key: 'identificacao', label: 'Identificação' },
      ...(isEditing
        ? [{ key: 'certificado' as TabKey, label: 'Certificado' }]
        : []),
      { key: 'nfe', label: 'NF-e' },
      { key: 'nfce', label: 'NFC-e' },
      { key: 'nfse', label: 'NFS-e' },
      { key: 'padroes', label: 'Padrões' },
      { key: 'reforma', label: 'Reforma' },
      { key: 'envio', label: 'Envio' },
    ]

    if (editType === 'GLOBAL') return all

    // O certificado é do emissor e bloqueia a ativação de QUALQUER tipo de
    // documento, então precisa estar em todas as listas. Sem isso ele só
    // aparecia com editType 'GLOBAL', que por sua vez só era usado para criar
    // um emissor novo — e aí `isEditing` era falso e a aba sumia de novo. Na
    // prática a aba era inalcançável e o wizard de ativação cobrava um
    // certificado sem oferecer onde enviá-lo.
    const permitidas: Record<Exclude<EditType, 'GLOBAL'>, TabKey[]> = {
      NFE: ['identificacao', 'certificado', 'nfe', 'padroes', 'reforma'],
      NFCE: ['identificacao', 'certificado', 'nfce', 'padroes', 'reforma'],
      NFSE: ['identificacao', 'certificado', 'nfse', 'reforma'],
    }
    return all.filter((t) => permitidas[editType].includes(t.key))
  }, [editType, isEditing])

  const [activeTab, setActiveTab] = useState<TabKey>('identificacao')

  // Reset form when emissor changes
  useEffect(() => {
    if (open) {
      const alvoInicial =
        initialTab && tabs.some((t) => t.key === initialTab)
          ? initialTab
          : (tabs[0]?.key ?? 'identificacao')
      setActiveTab(alvoInicial)

      if (emissor) {
        // A numeração exibida sai de `activeNumbering` — a linha do ambiente
        // ativo, que é a sequência que a emissão realmente consome. Os campos
        // legados (serieNfe/proximoNumeroNfe) são globais e ficaram como
        // fallback só para emissor antigo que ainda não tem linha ambiental.
        const numeracao = emissor.activeNumbering

        form.reset({
          name: emissor.name || '',
          isDefault: emissor.isDefault || false,
          isActive: emissor.isActive !== false,
          emitCrt: String(emissor.emitCrt || '1'),
          defaultNcm: emissor.defaultNcm || '',
          prazoCancelamentoNfce: emissor.prazoCancelamentoNfce ?? 30,
          prazoCancelamentoNfeHoras:
            emissor.prazoCancelamentoNfeHoras ?? undefined,
          ie: emissor.ie || '',
          im: emissor.im || '',
          serieNfe: Number(numeracao?.nfe?.series ?? emissor.serieNfe ?? 1),
          proximoNumeroNfe:
            numeracao?.nfe?.nextNumber ?? emissor.proximoNumeroNfe ?? 1,
          nfeNumberingEnvironment: numeracao?.nfe?.environment ?? 'HOMOLOGACAO',
          serieNfse: String(
            numeracao?.nfse?.series ?? emissor.serieNfse ?? 'A1',
          ),
          proximoRpsNfse:
            numeracao?.nfse?.nextNumber ?? emissor.proximoRpsNfse ?? 1,
          nfseNumberingEnvironment:
            numeracao?.nfse?.environment ?? 'HOMOLOGACAO',
          codigoServico: emissor.codigoServico || '',
          aliquotaIss: emissor.aliquotaIss,
          regimeEspecialTributacao:
            emissor.regimeEspecialTributacao != null
              ? String(emissor.regimeEspecialTributacao)
              : 'none',
          serieNfce: Number(numeracao?.nfce?.series ?? emissor.serieNfce ?? 1),
          proximoNumeroNfce:
            numeracao?.nfce?.nextNumber ?? emissor.proximoNumeroNfce ?? 1,
          nfceNumberingEnvironment:
            numeracao?.nfce?.environment ?? 'HOMOLOGACAO',
          defaultCfop: emissor.defaultCfop || '',
          defaultOperationNature: emissor.defaultOperationNature || '',
          taxInfoText: emissor.taxInfoText || '',
          sendDanfeXmlAutomatically: emissor.sendDanfeXmlAutomatically || false,
          sendDanfeAutomatically: emissor.sendDanfeAutomatically !== false,
          sendXmlAutomatically: emissor.sendXmlAutomatically !== false,
          sendFiscalEmailCopyTo: emissor.sendFiscalEmailCopyTo || '',
          // `??` e nao `||`: alíquota 0 e' legitima e nao pode virar vazio,
          // que no proximo save apagaria o ajuste do emissor.
          reformaTributariaAtiva: emissor.reformaTributariaAtiva ?? false,
          ibsCbsEnviarValores: emissor.ibsCbsEnviarValores ?? false,
          regApIbsCbsSn:
            emissor.regApIbsCbsSn != null
              ? String(emissor.regApIbsCbsSn)
              : 'none',
          aliquotaIbsUf: emissor.aliquotaIbsUf ?? undefined,
          aliquotaIbsMun: emissor.aliquotaIbsMun ?? undefined,
          aliquotaCbs: emissor.aliquotaCbs ?? undefined,
          indicadorOperacaoNfse: emissor.indicadorOperacaoNfse ?? '',
        })
      } else {
        form.reset()
      }
    }
    // `tabs` é derivado de editType/isEditing; incluí-lo causaria reset extra.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, emissor, initialTab, form])

  const handleSubmit = async (data: EmissorFormValues) => {
    setIsSubmitting(true)
    try {
      await onSave(sanitizeEmissorPayload(data))
      onOpenChange(false)
    } catch (error) {
      // Quem chama onSave já mostra a mensagem da API; aqui só garantimos que
      // o modal continue aberto para o usuário corrigir e tentar de novo.
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Erros de validação podem estar numa aba que não está visível. Levar o
  // usuário até a primeira aba com erro evita o "salvar não faz nada".
  const handleInvalid = (errors: Record<string, unknown>) => {
    const campoPorAba: Record<TabKey, string[]> = {
      identificacao: ['name', 'emitCrt', 'defaultNcm', 'isActive'],
      certificado: [],
      reforma: [
        'reformaTributariaAtiva',
        'ibsCbsEnviarValores',
        'regApIbsCbsSn',
        'aliquotaIbsUf',
        'aliquotaIbsMun',
        'aliquotaCbs',
        'indicadorOperacaoNfse',
      ],
      nfe: [
        'serieNfe',
        'proximoNumeroNfe',
        'nfeNumberingEnvironment',
        'prazoCancelamentoNfeHoras',
      ],
      nfce: [
        'serieNfce',
        'proximoNumeroNfce',
        'prazoCancelamentoNfce',
        'nfceNumberingEnvironment',
      ],
      nfse: [
        'serieNfse',
        'proximoRpsNfse',
        'aliquotaIss',
        'codigoServico',
        'regimeEspecialTributacao',
        'nfseNumberingEnvironment',
      ],
      padroes: ['defaultCfop', 'defaultOperationNature'],
      envio: ['taxInfoText', 'sendFiscalEmailCopyTo'],
    }

    const comErro = Object.keys(errors)
    const alvo = tabs.find((t) =>
      campoPorAba[t.key].some((campo) => comErro.includes(campo)),
    )
    if (alvo) setActiveTab(alvo.key)
  }

  const formId = 'emissor-form'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden gap-0">
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
          <DialogTitle>
            {isEditing ? 'Editar Emissor' : 'Novo emissor'}
            {editType !== 'GLOBAL' && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-xs font-normal">
                {editType === 'NFE'
                  ? 'NF-e'
                  : editType === 'NFSE'
                    ? 'NFS-e'
                    : 'NFC-e'}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Configure os dados do emissor para emissão de notas fiscais
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id={formId}
            onSubmit={form.handleSubmit(handleSubmit, handleInvalid)}
            className="flex-1 flex flex-col min-h-0"
          >
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as TabKey)}
              className="flex-1 flex flex-col min-h-0"
            >
              <div className="px-6 shrink-0">
                <TabsList className="w-full justify-start overflow-x-auto">
                  {tabs.map((t) => (
                    <TabsTrigger key={t.key} value={t.key}>
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                <TabsContent value="identificacao" className="m-0">
                  <IdentificacaoTab emissor={emissor} isEditing={isEditing} />
                </TabsContent>

                {isEditing && (
                  <TabsContent value="certificado" className="m-0">
                    <CertificadoTab
                      emissorId={emissor?.id}
                      initialHasCertificate={emissor?.company?.hasCertificate}
                    />
                  </TabsContent>
                )}

                <TabsContent value="nfe" className="m-0">
                  <NfeTab emissor={emissor} />
                </TabsContent>

                <TabsContent value="nfce" className="m-0">
                  <NfceTab emissor={emissor} />
                </TabsContent>

                <TabsContent value="nfse" className="m-0">
                  <NfseTab emissor={emissor} />
                </TabsContent>

                <TabsContent value="padroes" className="m-0">
                  <PadroesTab />
                </TabsContent>

                <TabsContent value="reforma" className="m-0">
                  <ReformaTab />
                </TabsContent>

                <TabsContent value="envio" className="m-0">
                  <EnvioTab />
                </TabsContent>
              </div>
            </Tabs>
          </form>
        </Form>

        <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={isSubmitting}
            className="bg-brand hover:bg-brand-600 text-white"
          >
            {isSubmitting && (
              <IconDeviceFloppy className="w-4 h-4 mr-2 animate-spin" />
            )}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
