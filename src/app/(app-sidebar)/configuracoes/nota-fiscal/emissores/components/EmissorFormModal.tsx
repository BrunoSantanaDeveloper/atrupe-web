// React
import { useState, useEffect, useMemo } from 'react'

// UI
import { toast } from 'sonner'
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

  // Fiscal Configs
  serieNfe: z.coerce.number().optional(),
  proximoNumeroNfe: z.coerce.number().optional(),
  serieNfse: z.string().optional(),
  proximoRpsNfse: z.coerce.number().optional(),
  codigoServico: z.string().optional(),
  aliquotaIss: z.coerce.number().optional(),
  serieNfce: z.coerce.number().optional(),
  proximoNumeroNfce: z.coerce.number().optional(),
  defaultCfop: z.string().optional(),
  defaultOperationNature: z.string().optional(),

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
 * Ambiente muda apenas via `activate`; CSC via `/environments/:env/csc`;
 * numeração ambiental via `/environments/:env/numbering`.
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
  return safe as EmissorFormValues
}

export type EditType = 'GLOBAL' | 'NFE' | 'NFSE' | 'NFCE'

interface EmissorFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  emissor?: EmissorData | null
  editType?: EditType
  onSave: (data: EmissorFormValues) => Promise<void>
}

type TabKey =
  | 'identificacao'
  | 'certificado'
  | 'nfe'
  | 'nfce'
  | 'nfse'
  | 'padroes'
  | 'envio'

export function EmissorFormModal({
  open,
  onOpenChange,
  emissor,
  editType = 'GLOBAL',
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
      serieNfe: 1,
      proximoNumeroNfe: 1,
      serieNfse: 'A1',
      proximoRpsNfse: 1,
      serieNfce: 1,
      proximoNumeroNfce: 1,
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
      { key: 'envio', label: 'Envio' },
    ]

    if (editType === 'GLOBAL') return all

    const permitidas: Record<Exclude<EditType, 'GLOBAL'>, TabKey[]> = {
      NFE: ['identificacao', 'nfe', 'padroes'],
      NFCE: ['identificacao', 'nfce', 'padroes'],
      NFSE: ['identificacao', 'nfse'],
    }
    return all.filter((t) => permitidas[editType].includes(t.key))
  }, [editType, isEditing])

  const [activeTab, setActiveTab] = useState<TabKey>('identificacao')

  // Reset form when emissor changes
  useEffect(() => {
    if (open) {
      setActiveTab(tabs[0]?.key ?? 'identificacao')

      if (emissor) {
        form.reset({
          name: emissor.name || '',
          isDefault: emissor.isDefault || false,
          isActive: emissor.isActive !== false,
          emitCrt: String(emissor.emitCrt || '1'),
          defaultNcm: emissor.defaultNcm || '',
          prazoCancelamentoNfce: emissor.prazoCancelamentoNfce ?? 30,
          ie: emissor.ie || '',
          im: emissor.im || '',
          serieNfe: emissor.serieNfe || 1,
          proximoNumeroNfe: emissor.proximoNumeroNfe || 1,
          serieNfse: emissor.serieNfse || 'A1',
          proximoRpsNfse: emissor.proximoRpsNfse || 1,
          codigoServico: emissor.codigoServico || '',
          aliquotaIss: emissor.aliquotaIss,
          serieNfce: emissor.serieNfce || 1,
          proximoNumeroNfce: emissor.proximoNumeroNfce || 1,
          defaultCfop: emissor.defaultCfop || '',
          defaultOperationNature: emissor.defaultOperationNature || '',
          taxInfoText: emissor.taxInfoText || '',
          sendDanfeXmlAutomatically: emissor.sendDanfeXmlAutomatically || false,
          sendDanfeAutomatically: emissor.sendDanfeAutomatically !== false,
          sendXmlAutomatically: emissor.sendXmlAutomatically !== false,
          sendFiscalEmailCopyTo: emissor.sendFiscalEmailCopyTo || '',
        })
      } else {
        form.reset()
      }
    }
    // `tabs` é derivado de editType/isEditing; incluí-lo causaria reset extra.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, emissor, form])

  const handleSubmit = async (data: EmissorFormValues) => {
    setIsSubmitting(true)
    try {
      await onSave(sanitizeEmissorPayload(data))
      onOpenChange(false)
    } catch (error) {
      toast.error('Erro ao salvar emissor')
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
      nfe: ['serieNfe', 'proximoNumeroNfe'],
      nfce: ['serieNfce', 'proximoNumeroNfce', 'prazoCancelamentoNfce'],
      nfse: ['serieNfse', 'proximoRpsNfse', 'aliquotaIss', 'codigoServico'],
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
            {isEditing ? 'Editar Emissor' : 'Novo Emissor'}
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
                  <NfeTab />
                </TabsContent>

                <TabsContent value="nfce" className="m-0">
                  <NfceTab emissor={emissor} />
                </TabsContent>

                <TabsContent value="nfse" className="m-0">
                  <NfseTab />
                </TabsContent>

                <TabsContent value="padroes" className="m-0">
                  <PadroesTab />
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
            Salvar Configuração
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
