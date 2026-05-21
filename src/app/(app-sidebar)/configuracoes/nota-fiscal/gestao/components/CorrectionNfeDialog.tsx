'use client'

// UI
import { toast } from 'sonner'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { FormTextarea } from '@/components/common/form/FormTextarea'

// Icons
import { IconPencil, IconCircleCheck } from '@tabler/icons-react'

// Form
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'

// Actions
import { createItemNew } from '@/actions/_cruds'

const correctionSchema = z.object({
  correction: z
    .string()
    .min(15, 'A correção deve ter pelo menos 15 caracteres'),
})

type CorrectionFormType = z.infer<typeof correctionSchema>

interface NfeItem {
  id: string
  number: number
  series: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  nfe: NfeItem | null
  onSuccess: () => void
}

export function CorrectionNfeDialog({
  open,
  onOpenChange,
  nfe,
  onSuccess,
}: Props) {
  const form = useForm<CorrectionFormType>({
    resolver: zodResolver(correctionSchema),
    defaultValues: {
      correction: '',
    },
  })
  const [errorMsg, setErrorMsg] = useState('')

  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  async function onSubmit(data: CorrectionFormType) {
    if (!nfe) return

    setErrorMsg('')
    try {
      const result = await createItemNew({
        route: `/fiscal/nfe/${nfe.id}/correction-letter`,
        data: {
          correcao: data.correction,
        },
      })

      if (!result.success) {
        throw new Error(result.message || 'Erro ao criar carta de correção')
      }

      toast.success('Carta de correção registrada com sucesso!')
      onSuccess()
      handleClose()
    } catch (error) {
      let message =
        error instanceof Error
          ? error.message
          : 'Erro ao criar carta de correção'

      // Tentativa de limpar problemas de encoding do backend
      message = message
        .replace(/correÃ§Ã£o/g, 'correção')
        .replace(/NÃ£o/g, 'Não')
        .replace(/possÃvel/g, 'possível')
        .replace(/operaÃ§Ã£o/g, 'operação')

      setErrorMsg(message)
      toast.error(message)
    }
  }

  if (!nfe) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="outline" Icon={IconPencil} />
              <div>
                <span>Carta de Correção</span>
                <p className="text-sm font-normal text-gray-500">
                  NF-e {nfe.number}/{nfe.series}
                </p>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="rounded-lg bg-blue-50 p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Informação:</strong> A Carta de Correção permite corrigir
              erros em dados não relacionados ao valor ou destinatário da nota.
              Podem ser registradas até 20 correções por NF-e.
            </p>
          </div>

          <Form {...form}>
            <form
              id="correction-nfe-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              <FormTextarea
                name="correction"
                label="Texto da Correção"
                placeholder="Descreva a correção a ser feita (mínimo 15 caracteres)"
                rows={4}
              />
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
                  {errorMsg}
                </div>
              )}
            </form>
          </Form>
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="neutralOutline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="correction-nfe-form"
            RightIcon={IconCircleCheck}
            disabled={form.formState?.isSubmitting}
            isLoading={form.formState?.isSubmitting}
          >
            Registrar Correção
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
