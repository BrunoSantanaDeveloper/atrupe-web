// React
import { useState, useEffect, useCallback } from 'react'

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
import { Separator } from '@/components/ui/separator'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormTextarea } from '@/components/common/form/FormTextarea'
import { FormSwitch } from '@/components/common/form/FormSwitch'
import { FormCheckbox } from '@/components/common/form/FormCheckbox'

// Icons
import {
  IconDeviceFloppy,
  IconCloudUpload,
  IconFileCertificate,
  IconCircleCheckFilled,
  IconTrash,
  IconLock,
} from '@tabler/icons-react'

// Dropzone
import { useDropzone } from 'react-dropzone'

// Form
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { EmissorData } from './EmissorListItem'
import { updateItemNew } from '@/actions/_cruds'
import { cn } from '@/lib/utils'

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

const crtOptions = [
  { value: '1', label: '1 - Simples Nacional' },
  { value: '2', label: '2 - Simples Nacional - Excesso de sublimite' },
  { value: '3', label: '3 - Regime Normal' },
  { value: '4', label: '4 - MEI' },
]

const certTypeOptions = [
  { value: 'A1', label: 'A1 (arquivo .pfx)' },
  { value: 'A3', label: 'A3 (token/smartcard)' },
]

export type EditType = 'GLOBAL' | 'NFE' | 'NFSE' | 'NFCE'

interface EmissorFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  emissor?: EmissorData | null
  editType?: EditType
  onSave: (data: EmissorFormValues) => Promise<void>
}

export function EmissorFormModal({
  open,
  onOpenChange,
  emissor,
  editType = 'GLOBAL',
  onSave,
}: EmissorFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Certificate state (managed separately from form)
  const [certBase64, setCertBase64] = useState<string | null>(null)
  const [certFileName, setCertFileName] = useState<string | null>(null)
  const [certPassword, setCertPassword] = useState('')
  const [certType, setCertType] = useState<'A1' | 'A3'>('A1')
  const [isUploadingCert, setIsUploadingCert] = useState(false)
  const [hasCertificate, setHasCertificate] = useState(false)

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

  const sendFiscalAutomatically = form.watch('sendDanfeXmlAutomatically')

  // Reset form when emissor changes
  useEffect(() => {
    if (open) {
      setCertBase64(null)
      setCertFileName(null)
      setCertPassword('')
      setCertType('A1')
      setHasCertificate(!!emissor?.company?.hasCertificate)

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
  }, [open, emissor, form])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1] // remove data URL prefix
        setCertBase64(base64)
        setCertFileName(file.name)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/x-pkcs12': ['.pfx', '.p12'] },
    multiple: false,
  })

  const handleRemoveCert = () => {
    setCertBase64(null)
    setCertFileName(null)
    setCertPassword('')
  }

  const handleUploadCertificate = async () => {
    if (!certBase64 || !certPassword || !emissor?.id) return
    setIsUploadingCert(true)
    try {
      const result = await updateItemNew({
        route: `/fiscal/emissores/${emissor.id}/certificate`,
        data: {
          certificate: certBase64,
          certificatePassword: certPassword,
          certificateType: certType,
        },
      })
      if (!result.success) {
        toast.error(result.message || 'Erro ao atualizar certificado')
        return
      }
      toast.success('Certificado atualizado com sucesso!')
      setCertBase64(null)
      setCertFileName(null)
      setCertPassword('')
      setHasCertificate(true)
    } catch {
      toast.error('Erro ao atualizar certificado')
    } finally {
      setIsUploadingCert(false)
    }
  }

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

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Form {...form}>
            <form
              id={formId}
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Identificação */}
              <div className="space-y-4">
                <div className="space-y-2 pb-2 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    Identificação
                  </h3>
                </div>

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

                <div>
                  <FormInput
                    name="defaultNcm"
                    label="NCM padrão para novos produtos"
                    placeholder="Ex: 49119900"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Aplicado ao cadastrar produtos novos. Não altera produtos
                    existentes nem substitui o NCM informado na nota.
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

              {/* Certificado Digital */}
              {isEditing && (
                <>
                  <Separator className="bg-gray-100" />
                  <div className="space-y-4">
                    <div className="space-y-2 pb-2 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <IconLock className="h-4 w-4 text-gray-500" />
                        Certificado Digital
                      </h3>
                      {hasCertificate && !certBase64 && (
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                          <IconCircleCheckFilled className="h-3.5 w-3.5" />
                          Certificado ativo
                        </span>
                      )}
                    </div>

                    {certBase64 ? (
                      /* Arquivo selecionado — mostrar info + campos */
                      <div className="space-y-4">
                        <div className="p-3 border rounded-lg flex items-center justify-between border-neutral-200 bg-white">
                          <div className="flex items-center gap-3">
                            <IconFileCertificate className="h-7 w-7 text-neutral-400 shrink-0" />
                            <p className="text-sm font-medium text-neutral-800 truncate">
                              {certFileName}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="neutralGhost"
                            size="icon"
                            onClick={handleRemoveCert}
                          >
                            <IconTrash className="h-4 w-4 text-neutral-500" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">
                              Tipo de Certificado
                            </label>
                            <select
                              value={certType}
                              onChange={(e) =>
                                setCertType(e.target.value as 'A1' | 'A3')
                              }
                              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                            >
                              {certTypeOptions.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">
                              Senha do Certificado *
                            </label>
                            <input
                              type="password"
                              value={certPassword}
                              onChange={(e) => setCertPassword(e.target.value)}
                              placeholder="Digite a senha do certificado"
                              autoComplete="new-password"
                              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                            />
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={handleUploadCertificate}
                          isLoading={isUploadingCert}
                          disabled={!certPassword || isUploadingCert}
                          className="w-full"
                        >
                          Salvar Certificado
                        </Button>
                      </div>
                    ) : (
                      /* Dropzone */
                      <div
                        {...getRootProps()}
                        className={cn(
                          'border border-dashed rounded-lg px-6 py-5 text-center cursor-pointer transition-colors',
                          isDragActive
                            ? 'border-brand-400 bg-brand-50'
                            : 'border-gray-300 hover:border-brand-300 bg-white',
                        )}
                      >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center gap-2">
                          <IconCloudUpload className="h-7 w-7 text-gray-400" />
                          <p className="text-sm text-gray-500">
                            <span className="text-brand-600 font-semibold">
                              {hasCertificate
                                ? 'Clique para substituir o certificado'
                                : 'Clique para selecionar o arquivo .pfx ou .p12'}
                            </span>
                            {' ou arraste aqui'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Configuração Fiscal */}
              <Separator className="bg-gray-100" />
              <div className="space-y-4">
                <div className="space-y-2 pb-2 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    Configuração Fiscal
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Grupo NFE e NFC-e */}
                  {(editType === 'GLOBAL' ||
                    editType === 'NFE' ||
                    editType === 'NFCE') && (
                    <div
                      className={`grid grid-cols-1 ${editType === 'GLOBAL' ? 'md:grid-cols-2' : ''} gap-4`}
                    >
                      {(editType === 'GLOBAL' || editType === 'NFE') && (
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                          <h4 className="font-medium text-sm text-gray-900 flex items-center gap-2">
                            <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                            Nota Fiscal (NF-e)
                          </h4>
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
                        </div>
                      )}

                      {(editType === 'GLOBAL' || editType === 'NFCE') && (
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                          <h4 className="font-medium text-sm text-gray-900 flex items-center gap-2">
                            <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
                            Consumidor (NFC-e)
                          </h4>
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
                          <div className="grid grid-cols-1">
                            <FormInput
                              name="prazoCancelamentoNfce"
                              label="Prazo de cancelamento (minutos)"
                              type="number"
                              placeholder="30"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Definido pela legislação da UF. Consulte a SEFAZ
                              do seu estado antes de alterar.
                            </p>
                          </div>
                          <div className="rounded-md border border-dashed border-gray-200 bg-white p-3">
                            <p className="text-xs text-gray-600">
                              CSC:{' '}
                              <span className="font-medium">
                                {emissor?.cscConfigured
                                  ? 'Configurado'
                                  : 'Não configurado'}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              O ID e o token do CSC são configurados por
                              ambiente no assistente de ativação.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Grupo NFS-e */}
                  {(editType === 'GLOBAL' || editType === 'NFSE') && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <h4 className="font-medium text-sm text-gray-900 flex items-center gap-2">
                        <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                        Serviços (NFS-e)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FormInput
                          name="serieNfse"
                          label="Série"
                          placeholder="Ex: A1"
                        />
                        <FormInput
                          name="proximoRpsNfse"
                          label="Próximo RPS"
                          type="number"
                        />
                        <FormInput
                          name="aliquotaIss"
                          label="Alíquota ISS (%)"
                          type="number"
                          step="0.01"
                        />
                      </div>
                      <div className="grid grid-cols-1">
                        <FormInput
                          name="codigoServico"
                          label="Código de Serviço Padrão (LC 116)"
                          placeholder="Ex: 17.06"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Código conforme Lei Complementar 116/2003
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Padrões de Operação */}
                  {(editType === 'GLOBAL' ||
                    editType === 'NFE' ||
                    editType === 'NFCE') && (
                    <div className="p-4 rounded-lg border border-gray-200 bg-white">
                      <h4 className="font-medium text-sm text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-1 h-4 bg-gray-400 rounded-full"></span>
                        Padrões de Operação
                      </h4>
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
                    </div>
                  )}
                </div>
              </div>

              {/* Informações Complementares */}
              {editType === 'GLOBAL' && (
                <>
                  <Separator className="bg-gray-100" />
                  <div className="space-y-4">
                    <div className="space-y-2 pb-2 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        Informações Complementares
                      </h3>
                    </div>

                    <FormTextarea
                      name="taxInfoText"
                      label="Informações Fiscais Complementares"
                      placeholder="Texto que será incluído nas notas fiscais"
                      rows={4}
                    />
                  </div>

                  {/* Envio ao Cliente */}
                  <Separator className="bg-gray-100" />
                  <div className="space-y-4">
                    <div className="space-y-2 pb-2 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        Envio ao Cliente
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Configure o envio automático dos documentos fiscais
                        quando a NF-e for autorizada.
                      </p>
                    </div>

                    <FormSwitch
                      name="sendDanfeXmlAutomatically"
                      label="Enviar DANFE/XML automaticamente ao cliente"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormCheckbox
                        name="sendDanfeAutomatically"
                        label="Enviar DANFE"
                        disabled={!sendFiscalAutomatically}
                      />
                      <FormCheckbox
                        name="sendXmlAutomatically"
                        label="Enviar XML"
                        disabled={!sendFiscalAutomatically}
                      />
                    </div>

                    <FormInput
                      name="sendFiscalEmailCopyTo"
                      label="E-mail para cópia"
                      type="email"
                      placeholder="financeiro@empresa.com"
                    />
                  </div>
                </>
              )}
            </form>
          </Form>
        </div>

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
