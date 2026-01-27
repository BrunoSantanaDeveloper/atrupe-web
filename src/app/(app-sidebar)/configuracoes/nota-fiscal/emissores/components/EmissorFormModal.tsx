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
import {
  IconChevronLeft,
  IconChevronRight,
  IconDeviceFloppy,
  IconBuilding,
  IconFileInvoice,
} from '@tabler/icons-react'

// Form
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Types
import type { EmissorData } from './EmissorRow'

// Utils
import { cn } from '@/lib/utils'

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

const STEPS = [
  {
    id: 'identificacao',
    title: 'Identificação',
    description: 'Dados gerais do emissor',
    icon: IconBuilding,
  },
  {
    id: 'fiscal',
    title: 'Configuração Fiscal',
    description: 'Numeração de notas, séries e parâmetros fiscais',
    icon: IconFileInvoice,
  },
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
  const [currentStep, setCurrentStep] = useState(0)
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
      // Jump to Fiscal step if editing specific type
      if (editType !== 'GLOBAL' && editType !== 'NFCE') {
        // NFCE is disabled in logic but kept for safety
        setCurrentStep(1)
      } else {
        setCurrentStep(0)
      }

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
  }, [open, emissor, form, editType])

  const handleNext = async () => {
    // Validate current step fields
    let fieldsToValidate: (keyof EmissorFormValues)[] = []

    switch (currentStep) {
      case 0:
        fieldsToValidate = ['name', 'emitCrt', 'ambiente']
        break
      // Add other step validations as needed
    }

    const isValid = await form.trigger(fieldsToValidate)
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

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

  const currentStepData = STEPS[currentStep]
  const StepIcon = currentStepData.icon
  const isLastStep = currentStep === STEPS.length - 1
  const formId = 'emissor-form'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden gap-0">
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

        <div className="flex-1 overflow-y-auto px-6 py-2">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 my-4">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  'flex items-center gap-2',
                  index < STEPS.length - 1 && 'flex-1',
                )}
              >
                <button
                  type="button"
                  onClick={() => index < currentStep && setCurrentStep(index)}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    index === currentStep
                      ? 'bg-brand text-white'
                      : index < currentStep
                        ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600'
                        : 'bg-gray-200 text-gray-500',
                  )}
                >
                  {index + 1}
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5',
                      index < currentStep ? 'bg-green-500' : 'bg-gray-200',
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Title */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <StepIcon className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h3 className="font-semibold">{currentStepData.title}</h3>
              <p className="text-sm text-gray-500">
                {currentStepData.description}
              </p>
            </div>
          </div>

          <Form {...form}>
            <form
              id={formId}
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {/* Step 1: Identificação */}
              {currentStep === 0 && (
                <div className="space-y-4">
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

                  <div className="bg-blue-50 text-blue-700 p-4 rounded-md text-sm">
                    <p>
                      Os dados da empresa (CNPJ, Endereço, Certificado Digital e
                      Tokens) são obtidos automaticamente do cadastro da
                      empresa. Certifique-se de que as informações da empresa
                      estejam completas e atualizadas.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Configuração Fiscal */}
              {currentStep === 1 && (
                <div className="space-y-4 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                  {/* NF-e Section */}
                  {(editType === 'GLOBAL' || editType === 'NFE') && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <div className="font-semibold text-brand-700">NF-e</div>
                        <div className="text-xs text-gray-400 font-normal">
                          Nota Fiscal Eletrônica - Produtos
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                          name="serieNfe"
                          label="Série NF-e"
                          type="number"
                          placeholder="1"
                        />
                        <FormInput
                          name="proximoNumeroNfe"
                          label="Próximo Número NF-e"
                          type="number"
                          placeholder="Ex: 105"
                        />
                      </div>
                    </div>
                  )}

                  {/* NFS-e Section */}
                  {(editType === 'GLOBAL' || editType === 'NFSE') && (
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <div className="font-semibold text-brand-700">
                          NFS-e
                        </div>
                        <div className="text-xs text-gray-400 font-normal">
                          Nota Fiscal de Serviço
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                          name="serieNfse"
                          label="Série RPS"
                          placeholder="A1"
                        />
                        <FormInput
                          name="proximoRpsNfse"
                          label="Próximo Número RPS"
                          type="number"
                          placeholder="Ex: 50"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                          name="codigoServico"
                          label="Código Serviço Padrão"
                          placeholder="Ex: 10.05"
                        />
                        <FormInput
                          name="aliquotaIss"
                          label="Alíquota ISS (%)"
                          type="number"
                          step="0.01"
                          placeholder="Ex: 2.5"
                        />
                      </div>
                    </div>
                  )}

                  {/* NFC-e Section */}
                  {(editType === 'GLOBAL' || editType === 'NFCE') && (
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <div className="font-semibold text-brand-700">
                          NFC-e
                        </div>
                        <div className="text-xs text-gray-400 font-normal">
                          Nota Consumidor
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                          name="serieNfce"
                          label="Série NFC-e"
                          type="number"
                          placeholder="1"
                        />
                        <FormInput
                          name="proximoNumeroNfce"
                          label="Próximo Número NFC-e"
                          type="number"
                          placeholder="Ex: 1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          </Form>
        </div>

        <DialogFooter className="px-6 pb-6 pt-4 border-t bg-white shrink-0">
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
              LeftIcon={IconChevronLeft}
            >
              Voltar
            </Button>
          )}

          {!isLastStep ? (
            <Button
              type="button"
              onClick={handleNext}
              RightIcon={IconChevronRight}
            >
              Próximo
            </Button>
          ) : (
            <Button
              type="submit"
              form={formId}
              disabled={isSubmitting}
              RightIcon={IconDeviceFloppy}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Emissor'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
