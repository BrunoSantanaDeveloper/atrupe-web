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

// Form
import { useForm } from 'react-hook-form'
import { schema, type FormType } from './schema'
import { zodResolver } from '@hookform/resolvers/zod'

// Icons
import { IconNotes, IconCircleCheck } from '@tabler/icons-react'

// Third-party
import { useQueryClient } from '@tanstack/react-query'

// Action
import { updateItemNew } from '@/actions/_cruds'

// Types
import type { TransactionListType } from '@/types/financial/financialFlow'

interface Props {
  open: boolean
  setOpen: (value: string) => void
  rowData?: TransactionListType
  type?: 'receivable' | 'payable'
}

export function TransacionNotesDialog({ open, type, rowData, setOpen }: Props) {
  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    values: {
      notes: rowData?.notes || '',
    },
  })

  const { handleSubmit, formState } = form

  const queryClient = useQueryClient()

  const onSubmit = async (data: FormType) => {
    const result = await updateItemNew({
      route: `/financial/${type}/${rowData?.id}`,
      data,
    })

    if (result.success) {
      queryClient.invalidateQueries()
      toast.success('Observações salvas!')
      setOpen('')
    } else {
      toast.error('Ocorreu um erro!')
    }
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
            <div className="min-w-0">
              <DialogTitle className="mb-1">Observação</DialogTitle>
              <DialogDescription className="truncate">
                {`${rowData?.client?.name || rowData?.supplier?.name || rowData?.employee?.name || ''} - ${rowData?.description}`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="transaction-notes"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <FormTextarea<FormType>
                name="notes"
                label="Observação da movimentação"
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
              form="transaction-notes"
              RightIcon={IconCircleCheck}
              isLoading={formState.isSubmitting}
            >
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
