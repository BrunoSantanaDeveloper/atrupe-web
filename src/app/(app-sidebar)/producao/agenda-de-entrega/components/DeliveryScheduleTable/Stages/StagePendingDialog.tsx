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
import { FormTextarea } from '@/components/common/form/FormTextarea'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { stagePendingSchema, type StagePendingType } from './schema'

// Icons
import { IconCircleCheck, IconAlertTriangle } from '@tabler/icons-react'
import { useEffect } from 'react'

// Third-party
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Action
import { updateItem } from '@/actions/_cruds'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { DeliveryScheduleType } from '@/types/production/deliverySchedule'

interface Props extends SearchParamsType {
  open: boolean
  setOpen: (value: boolean) => void
  rowData?: DeliveryScheduleType['productionStages'][0]
}

export function StagePendingDialog({ open, rowData, setOpen }: Props) {
  const form = useForm<StagePendingType>({
    resolver: zodResolver(stagePendingSchema),
    defaultValues: {
      pendingDescription: rowData?.notes || '',
    },
  })

  const { handleSubmit, reset } = form

  const queryClient = useQueryClient()

  useEffect(() => {
    if (rowData) reset({ pendingDescription: rowData.notes || '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowData, open])

  const mutation = useMutation({
    mutationFn: (data: StagePendingType) =>
      updateItem('productionStage', `${rowData?.id}`, {
        status: rowData?.status === 'PENDING' ? rowData?.prevStatus : 'PENDING',
        notes: rowData?.status === 'PENDING' ? '' : data.pendingDescription,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-schedule-list'] })
      toast.success('Status alterado')
    },
    onSettled: () => {
      handleOpenChange(false)
    },
  })

  const onSubmit = async (data: StagePendingType) => {
    await mutation.mutateAsync(data)
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen(openDialog)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[564px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconAlertTriangle} />
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
