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
import { itemNotesSchema, type ItemNotesType } from './schema'
import { QUOTATION_DATA_QUERY_KEY } from '../../Quotation'

// Icons
import { IconBulb, IconCircleCheck } from '@tabler/icons-react'

// Third-party
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Actions
import { updateItem } from '@/actions/_cruds'

// Types
import { QuotationType, QuotationItemType } from '@/types/sales/quotation'

import { useEffect } from 'react'

interface Props {
  open: boolean
  setOpen: (value: string) => void
  quotationData: QuotationType
  rowData?: QuotationItemType
  orderId?: string
}

export function ItemNotesDialog({ open, setOpen, rowData }: Props) {
  const form = useForm<ItemNotesType>({
    resolver: zodResolver(itemNotesSchema),
    values: {
      notes: rowData?.notes || '',
    },
  })

  const { handleSubmit, reset } = form

  const queryClient = useQueryClient()

  useEffect(() => {
    if (rowData) reset({ notes: rowData.notes }) // TODO : otimizar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowData, open])

  const mutation = useMutation({
    mutationFn: (data: ItemNotesType) =>
      updateItem('quotationRoute', `update-product/${rowData?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTATION_DATA_QUERY_KEY] })
      toast.success('Observações salvas!')
      setOpen('')
    },
  })

  const onSubmit = async (data: ItemNotesType) => {
    await mutation.mutateAsync(data)
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen(openDialog ? 'notes' : '')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[950px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconBulb} />
            <DialogTitle>{rowData?.product?.name}</DialogTitle>
          </div>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="quotation-notes"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              {/* Esta observação não vai pro pdf */}
              <FormTextarea<ItemNotesType>
                name="notes"
                label="Observação"
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
              form="quotation-notes"
              RightIcon={IconCircleCheck}
              isLoading={mutation.isPending}
            >
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
