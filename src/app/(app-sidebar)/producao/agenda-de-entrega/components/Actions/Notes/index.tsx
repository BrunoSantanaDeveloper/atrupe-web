// UI component
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

// Form Imports
import { useForm } from 'react-hook-form'
import { schema, type FormType } from './schema'
import { zodResolver } from '@hookform/resolvers/zod'

// Icon Imports
import { IconNotes, IconCircleCheck } from '@tabler/icons-react'
import { useEffect } from 'react'

// Third-party
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Action
import { updateItem } from '@/actions/_cruds'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'
import type { DeliveryScheduleType } from '@/types/production/deliverySchedule'

interface Props extends SearchParamsType {
  open: boolean
  setOpen: (value: string) => void
  rowData?: DeliveryScheduleType
}

export function DeliveryScheduleNotesDialog({ open, rowData, setOpen }: Props) {
  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      notes: '',
    },
  })

  const { handleSubmit, reset } = form

  const queryClient = useQueryClient()

  useEffect(() => {
    if (rowData) reset({ notes: rowData.notes })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowData, open])

  const mutation = useMutation({
    mutationFn: (data: FormType) =>
      updateItem('deliveryScheduleRoute', rowData?.id || '', data),
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit = async (data: FormType) => {
    await mutation.mutateAsync(data).then(() => {
      toast.success('Observações salvas!')
      setOpen('')
    })
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen(openDialog ? 'notes' : '')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[950px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconNotes} />
            <DialogTitle>Observação</DialogTitle>
          </div>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="delivery-schedule-notes"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <FormTextarea<FormType>
                name="notes"
                label="Observação do serviço"
                rows={6}
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
              form="delivery-schedule-notes"
              RightIcon={IconCircleCheck}
            >
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
