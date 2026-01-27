// React
import { useState, useEffect } from 'react'

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

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'

// Icons
import { IconDeviceFloppy } from '@tabler/icons-react'

// Form
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { EmissorData } from './EmissorListItem'

const emissoresSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  isDefault: z.boolean().optional(),
  ambiente: z.string().optional(),

  // Identificação
  emitCrt: z.string().optional(),

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
})

export type EmissorFormValues = z.infer<typeof emissoresSchema>

const crtOptions = [
  { value: '1', label: '1 - Simples Nacional' },
  { value: '2', label: '2 - Simples Nacional - Excesso de sublimite' },
  { value: '3', label: '3 - Regime Normal' },
]

const ambienteOptions = [
  { value: 'PRODUCAO', label: 'Produção' },
  { value: 'HOMOLOGACAO', label: 'Homologação' },
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

  const isEditing = !!emissor?.id

  const form = useForm<EmissorFormValues>({
    resolver: zodResolver(emissoresSchema),
    defaultValues: {
      name: '',
      isDefault: false,
      ambiente: 'HOMOLOGACAO',
      emitCrt: '1',
      // Fiscal defaults
      serieNfe: 1,
      proximoNumeroNfe: 1,
      serieNfse: 'A1',
      proximoRpsNfse: 1,
      serieNfce: 1,
      proximoNumeroNfce: 1,
    },
  })

  // Reset form when emissor changes
  useEffect(() => {
    if (open) {
      if (emissor) {
        form.reset({
          name: emissor.name || '',
          isDefault: emissor.isDefault || false,
          ambiente: emissor.environment || 'HOMOLOGACAO',
          emitCrt: String(emissor.emitCrt || '1'),
          // Fiscal
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
        })
      } else {
        form.reset()
      }
    }
  }, [open, emissor, form])

  const handleSubmit = async (data: EmissorFormValues) => {
    setIsSubmitting(true)
    try {
      await onSave(data)
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelect
                    name="ambiente"
                    label="Ambiente"
                    options={ambienteOptions}
                  />
                  <FormSelect
                    name="emitCrt"
                    label="Código de Regime Tributário"
                    options={crtOptions}
                  />
                </div>
              </div>

              {/* Configuração Fiscal */}
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

                  {/* Configurações Padrão (CFOP/Natureza) - Apenas para NFE/NFCE/GLOBAL */}
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
