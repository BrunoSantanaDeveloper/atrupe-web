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
import { IconAlertTriangle, IconX } from '@tabler/icons-react'

// Form
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Actions
import { createItemNew } from '@/actions/_cruds'

const cancelSchema = z.object({
  reason: z
    .string()
    .min(15, 'A justificativa deve ter pelo menos 15 caracteres'),
})

type CancelFormType = z.infer<typeof cancelSchema>

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
  isNfce?: boolean
}

export function CancelNfeDialog({
  open,
  onOpenChange,
  nfe,
  onSuccess,
  isNfce = false,
}: Props) {
  const form = useForm<CancelFormType>({
    resolver: zodResolver(cancelSchema),
    defaultValues: {
      reason: '',
    },
  })

  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  async function onSubmit(data: CancelFormType) {
    if (!nfe) return

    try {
      const route = isNfce
        ? `/fiscal/nfce/${nfe.id}/cancel`
        : `/fiscal/nfe/${nfe.id}/cancel`
      const result = await createItemNew({
        route,
        data: {
          justificativa: data.reason,
        },
      })

      if (!result.success) {
        throw new Error(
          result.message || `Erro ao cancelar ${isNfce ? 'NFC-e' : 'NF-e'}`,
        )
      }

      toast.success(`${isNfce ? 'NFC-e' : 'NF-e'} cancelada com sucesso!`)
      onSuccess()
      handleClose()
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `Erro ao cancelar ${isNfce ? 'NFC-e' : 'NF-e'}`
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
              <FeaturedIcon variant="errorLight" Icon={IconAlertTriangle} />
              <div>
                <span>Cancelar {isNfce ? 'NFC-e' : 'NF-e'}</span>
                <p className="text-sm font-normal text-gray-500">
                  {isNfce ? 'NFC-e' : 'NF-e'} {nfe.number}/{nfe.series}
                </p>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="rounded-lg bg-yellow-50 p-4 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Atenção:</strong> O cancelamento de{' '}
              {isNfce ? 'NFC-e' : 'NF-e'} só pode ser realizado dentro do prazo
              regulamentar após a autorização. Esta ação é irreversível.
            </p>
          </div>

          <Form {...form}>
            <form
              id="cancel-nfe-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              <FormTextarea
                name="reason"
                label="Justificativa do Cancelamento"
                placeholder="Informe o motivo do cancelamento (mínimo 15 caracteres)"
                rows={4}
              />
            </form>
          </Form>
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="neutralOutline" onClick={handleClose}>
            Voltar
          </Button>
          <Button
            type="submit"
            form="cancel-nfe-form"
            variant="error"
            RightIcon={IconX}
            disabled={form.formState?.isSubmitting}
            isLoading={form.formState?.isSubmitting}
          >
            Cancelar {isNfce ? 'NFC-e' : 'NF-e'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
