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
import { FormTextarea } from '@/components/common/form/FormTextarea'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { stagePendingSchema, type StagePendingType } from './schema'

// Icons
import { IconCircleCheck } from '@tabler/icons-react'
import { useEffect } from 'react'

// Third-party
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Action
import { updateItemNew } from '@/actions/_cruds'

// Hooks
import { usePlanErrorToast } from '@/hooks/usePlanErrorToast'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { DeliveryScheduleType } from '@/types/production/deliverySchedule'

interface Props extends SearchParamsType {
  open: boolean
  setOpen: (value: boolean) => void
  rowData?: DeliveryScheduleType['productionStages'][0]
  /** A rota da troca: a etapa do pedido (padrão) ou a do item (§4.7) */
  route?: string
}

export function StagePendingDialog({ open, rowData, setOpen, route }: Props) {
  const form = useForm<StagePendingType>({
    resolver: zodResolver(stagePendingSchema),
    defaultValues: {
      pendingDescription: rowData?.notes || '',
    },
  })

  const { handleSubmit, reset, setError } = form

  const queryClient = useQueryClient()
  const { notifyActionError } = usePlanErrorToast()

  useEffect(() => {
    if (rowData) reset({ pendingDescription: rowData.notes || '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowData, open])

  const mutation = useMutation({
    mutationFn: (data: StagePendingType) =>
      updateItemNew({
        route: route || `/sale/production-stage/${rowData?.id}`,
        data: {
          status:
            rowData?.status === 'PENDING' ? rowData?.prevStatus : 'PENDING',
          notes: rowData?.status === 'PENDING' ? '' : data.pendingDescription,
        },
      }),
    onSuccess: (res) => {
      if (!res.success) {
        // Trocar o status da etapa é recurso de plano: o servidor recusa sem
        // ele.
        notifyActionError(res)
        return
      }
      queryClient.invalidateQueries({ queryKey: ['delivery-schedule-list'] })
      toast.success('Status alterado')
    },
    onSettled: () => {
      handleOpenChange(false)
    },
  })

  const onSubmit = async (data: StagePendingType) => {
    // Pendência nova precisa dizer o que falta; remover não pede texto
    if (rowData?.status !== 'PENDING' && !data.pendingDescription?.trim()) {
      setError('pendingDescription', { message: 'Descreva a pendência' })
      return
    }
    await mutation.mutateAsync(data).catch(() => notifyActionError(null))
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen(openDialog)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[564px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <DialogTitle>Pendência</DialogTitle>
          </div>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="stage-pending-description"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <FormTextarea<StagePendingType>
                name="pendingDescription"
                label="Descrição da pendência"
                rows={6}
                disabled={rowData?.status === 'PENDING'}
              />
            </form>
          </Form>
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <div></div>
          <div className="space-x-4">
            <Button
              type="button"
              variant="neutralOutline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="stage-pending-description"
              RightIcon={IconCircleCheck}
              isLoading={mutation.isPending}
            >
              {rowData?.status === 'PENDING' ? 'Remover pendência' : 'Salvar'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
