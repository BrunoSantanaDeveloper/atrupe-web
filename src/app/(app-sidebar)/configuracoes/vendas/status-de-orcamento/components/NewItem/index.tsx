'use client'

// React
import { useEffect, useState } from 'react'

// UI
import { toast } from 'sonner'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'

// Components
import { FormInput } from '@/components/common/form/FormInput'

// Icons
import { IconPlus, IconCircleCheck, IconPencil } from '@tabler/icons-react'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { defaultValues, schema, type FormType } from './schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Types
import type { QuotationStatusType } from '@/types/settings/quotationStatus'

// Actions
import { createItemNew, updateItemNew } from '@/actions/_cruds'
import { Badge } from '@/components/ui/badge'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Hooks
import { usePlanErrorToast } from '@/hooks/usePlanErrorToast'

interface Props {
  editMode?: boolean
  open?: boolean
  setOpen?: (value: string) => void
  rowData?: QuotationStatusType
}

export function NewItemDialog({ editMode, rowData, open, setOpen }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const queryClient = useQueryClient()
  const { notifyActionError } = usePlanErrorToast()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues,
    values: {
      title: rowData?.title || '',
      color: rowData?.color || '',
    },
  })

  const { watch, reset, handleSubmit } = form

  useEffect(() => setDialogOpen(open ?? false), [open])

  const mutation = useMutation({
    mutationFn: (data: FormType) =>
      editMode
        ? updateItemNew({ route: `/sale/status/${rowData?.id}`, data })
        : createItemNew({ route: '/sale/status', data }),
    onSuccess: (res) => {
      if (res.success) queryClient.invalidateQueries()
    },
  })

  const onSubmit = async (data: FormType) => {
    const res = await mutation.mutateAsync(data).catch(() => null)

    if (!res?.success) {
      // Configurar status é recurso de plano: o servidor recusa sem ele.
      notifyActionError(res)
      return
    }

    toast.success('Status salvo')
    handleOpenChange(false)
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen?.(openDialog ? 'edit' : '')
    setDialogOpen(openDialog)
    reset()
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {!editMode && (
        <DialogTrigger asChild>
          <Button type="button" LeftIcon={IconPlus}>
            Novo status
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon
              variant="neutralOutline"
              Icon={editMode ? IconPencil : IconPlus}
            />
            <DialogTitle>{editMode ? 'Editar' : 'Novo'} status</DialogTitle>
          </div>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="flex justify-center items-center gap-2 my-4">
            <Badge
              className="text-white"
              variant="neutralLight"
              style={{
                backgroundColor: watch('color') || '#000',
              }}
            >
              {watch('title') || 'Exemplo'}
            </Badge>
          </div>
          <Form {...form}>
            <form
              id="submit-form"
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-wrap gap-5"
              noValidate
            >
              <FormInput<FormType>
                name="title"
                label="Status"
                width="flex-[1_0_100px]"
                maxLength={40}
              />
              <FormInput<FormType>
                type="color"
                name="color"
                label="Cor"
                width="w-12"
              />
            </form>
          </Form>
        </DialogBody>
        <DialogFooter>
          <DialogTrigger asChild>
            <Button type="button" variant="neutralOutline">
              Cancelar
            </Button>
          </DialogTrigger>
          <Button
            type="submit"
            form="submit-form"
            isLoading={form.formState.isSubmitting}
            RightIcon={IconCircleCheck}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
