'use client'

// React
import { useEffect } from 'react'

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
import { ScrollArea } from '@/components/ui/scroll-area'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormTextarea } from '@/components/common/form/FormTextarea'

// Icons
import { IconDeviceFloppy } from '@tabler/icons-react'

// Form
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Types
import type { OperationNatureData } from './NaturezaRow'
import type { CfopData } from './CfopRow'

const natureSchema = z.object({
  description: z.string().min(3, 'Descrição é obrigatória'),
  type: z.enum(['ENTRADA', 'SAIDA']),
  finality: z.string().min(1, 'Finalidade é obrigatória'),
  consumerPresence: z.string().min(1, 'Presença do consumidor é obrigatória'),
  cfopInternalId: z.string().optional(),
  cfopExternalId: z.string().optional(),
  info: z.string().optional(),
})

type NatureFormType = z.infer<typeof natureSchema>

const typeOptions = [
  { value: 'SAIDA', label: 'Saída' },
  { value: 'ENTRADA', label: 'Entrada' },
]

const finalityOptions = [
  { value: '1', label: '1 - NF-e normal' },
  { value: '2', label: '2 - NF-e complementar' },
  { value: '3', label: '3 - NF-e de ajuste' },
  { value: '4', label: '4 - Devolução/Retorno' },
]

const consumerPresenceOptions = [
  { value: '0', label: '0 - Não se aplica' },
  { value: '1', label: '1 - Operação presencial' },
  { value: '2', label: '2 - Operação não presencial, pela Internet' },
  { value: '3', label: '3 - Operação não presencial, Teleatendimento' },
  { value: '4', label: '4 - NFC-e em operação com entrega a domicílio' },
  { value: '9', label: '9 - Operação não presencial, outros' },
]

interface NaturezaFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nature?: OperationNatureData | null
  cfops: CfopData[]
  onSave: (data: NatureFormType) => Promise<void>
}

export function NaturezaFormModal({
  open,
  onOpenChange,
  nature,
  cfops,
  onSave,
}: NaturezaFormModalProps) {
  const isEditing = !!nature?.id

  const form = useForm<NatureFormType>({
    resolver: zodResolver(natureSchema),
    defaultValues: {
      description: '',
      type: 'SAIDA',
      finality: '1',
      consumerPresence: '0',
      cfopInternalId: '',
      cfopExternalId: '',
      info: '',
    },
  })

  const cfopOptions = cfops.map((c) => ({
    value: c.id,
    label: `${c.code} - ${c.description}`,
  }))

  // Reset form when nature changes
  useEffect(() => {
    if (open) {
      if (nature) {
        form.reset({
          description: nature.description || '',
          type: nature.type || 'SAIDA',
          finality: nature.finality || '1',
          consumerPresence: nature.consumerPresence || '0',
          cfopInternalId: nature.cfopInternal?.id || '',
          cfopExternalId: nature.cfopExternal?.id || '',
          info: (nature as any).info || '', // cast if info missing in type
        })
      } else {
        form.reset({
          description: '',
          type: 'SAIDA',
          finality: '1',
          consumerPresence: '0',
          cfopInternalId: '',
          cfopExternalId: '',
          info: '',
        })
      }
    }
  }, [open, nature, form])

  const handleSubmit = async (data: NatureFormType) => {
    await onSave(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>
            {isEditing ? 'Editar Natureza' : 'Nova natureza'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize os dados da Natureza de Operação'
              : 'Configure uma nova Natureza de Operação para emissão de notas'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                <p>
                  As informações cadastradas aqui serão utilizadas para
                  preencher automaticamente os campos da Nota Fiscal quando esta
                  Natureza for selecionada.
                </p>
              </div>

              <FormInput
                name="description"
                label="Descrição da Natureza de Operação"
                placeholder="Digite aqui (ex: Venda de mercadoria)"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormSelect name="type" label="Tipo" options={typeOptions} />
                <FormSelect
                  name="finality"
                  label="Finalidade da emissão"
                  options={finalityOptions}
                />
                <FormSelect
                  name="consumerPresence"
                  label="Presença do consumidor"
                  options={consumerPresenceOptions}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  name="cfopInternalId"
                  label="CFOP dentro do estado"
                  options={cfopOptions}
                  placeholder="Selecione..."
                />
                <FormSelect
                  name="cfopExternalId"
                  label="CFOP fora do estado"
                  options={cfopOptions}
                  placeholder="Selecione..."
                />
              </div>

              <FormTextarea
                name="info"
                label="Informações complementares"
                placeholder="Digite aqui informações adicionais que devem sair na nota..."
                rows={4}
              />
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t bg-gray-50/50">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            onClick={form.handleSubmit(handleSubmit)}
            RightIcon={IconDeviceFloppy}
          >
            {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
