'use client'

// React
import { useEffect } from 'react'

// UI
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormTextarea } from '@/components/common/form/FormTextarea'

// Icons
import { IconPencil, IconPlus, IconCircleCheck } from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

// Form
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Types
import type { CfopData } from './CfopRow'

const cfopSchema = z.object({
  code: z.string().min(4, 'Código CFOP deve ter pelo menos 4 dígitos'),
  description: z.string().min(3, 'Descrição é obrigatória'),
  type: z.enum(['ENTRADA', 'SAIDA']),
  info: z.string().optional(),
})

type CfopFormType = z.infer<typeof cfopSchema>

const typeOptions = [
  { value: 'SAIDA', label: 'Saída' },
  { value: 'ENTRADA', label: 'Entrada' },
]

interface CfopFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cfop?: CfopData | null
  onSave: (data: CfopFormType) => Promise<void>
}

export function CfopFormModal({
  open,
  onOpenChange,
  cfop,
  onSave,
}: CfopFormModalProps) {
  const isEditing = !!cfop?.id

  const form = useForm<CfopFormType>({
    resolver: zodResolver(cfopSchema),
    defaultValues: {
      code: '',
      description: '',
      type: 'SAIDA',
      info: '',
    },
  })

  // Reset form when cfop changes
  useEffect(() => {
    if (open) {
      if (cfop) {
        form.reset({
          code: cfop.code || '',
          description: cfop.description || '',
          type: cfop.type || 'SAIDA',
          info: (cfop as any).info || '',
        })
      } else {
        form.reset({
          code: '',
          description: '',
          type: 'SAIDA',
          info: '',
        })
      }
    }
  }, [open, cfop, form])

  // Auto-infer type from code
  const codeValue = form.watch('code')
  useEffect(() => {
    if (codeValue && codeValue.length >= 1) {
      const firstDigit = codeValue.charAt(0)
      // 1, 2, 3 -> ENTRADA
      // 5, 6, 7 -> SAIDA
      if (['1', '2', '3'].includes(firstDigit)) {
        form.setValue('type', 'ENTRADA')
      } else if (['5', '6', '7'].includes(firstDigit)) {
        form.setValue('type', 'SAIDA')
      }
    }
  }, [codeValue, form])

  const handleSubmit = async (data: CfopFormType) => {
    await onSave(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 gap-0 overflow-hidden border-0">
        {/* Custom Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
              <Icon
                icon={isEditing ? IconPencil : IconPlus}
                size="md"
                className="text-gray-700"
              />
            </div>
            <DialogTitle>{isEditing ? 'Editar CFOP' : 'Novo CFOP'}</DialogTitle>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 bg-gray-50/30 space-y-6">
          {/* Info Alert Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1">
              Sempre revise as informações cadastradas com seu contador.
              Lembretes:
            </p>
            <ul className="list-none space-y-1 text-gray-500">
              <li>
                - 1º Digito: 1 e 2 são operações de Entrada, dentro e fora do
                estado respectivamente.
              </li>
              <li>
                - 1º Digito: 5 e 6 são operações de Saída, dentro e fora do
                estado respectivamente.
              </li>
            </ul>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  name="code"
                  label="4 dígitos CFOP"
                  placeholder="Digite aqui"
                  maxLength={4}
                  className="bg-white"
                />

                <FormInput
                  name="description"
                  label="Descrição do CFOP"
                  placeholder="Digite aqui"
                  className="bg-white"
                />
              </div>

              <FormTextarea
                name="info"
                label="Informações de uso"
                placeholder="Digite aqui"
                rows={4}
                className="bg-white resize-none"
              />

              {/* Hidden Type Field - kept for state management */}
              <div className="hidden">
                <FormSelect name="type" label="Tipo" options={typeOptions} />
              </div>
            </form>
          </Form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            onClick={form.handleSubmit(handleSubmit)}
            className="bg-green-600 hover:bg-green-700 text-white"
            RightIcon={IconCircleCheck}
          >
            {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
