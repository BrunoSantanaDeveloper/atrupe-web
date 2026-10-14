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
import { defaultValues, schema, type FormType } from '../schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Actions
import { createItemNew, updateItemNew } from '@/actions/_cruds'
import { FeaturedIcon } from '@/components/ui/featured-icon'

interface CategoryType {
  id: string
  name: string
  kind: 'CLIENT' | 'SUPPLIER'
}

interface Props {
  editMode?: boolean
  open?: boolean
  setOpen?: (value: string) => void
  rowData?: CategoryType
  context: 'client' | 'supplier'
}

export function NewItemDialog({
  editMode,
  rowData,
  open,
  setOpen,
  context,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues,
    values: {
      name: rowData?.name || '',
    },
  })

  const { reset, handleSubmit } = form

  useEffect(() => setDialogOpen(open ?? false), [open])

  const mutation = useMutation({
    mutationFn: (data: FormType) => {
      const body = {
        name: data.name,
        kind: context === 'client' ? 'CLIENT' : 'SUPPLIER',
      }

      return editMode
        ? updateItemNew({ route: `/category/${rowData?.id}`, data: body })
        : createItemNew({ route: '/category', data: body })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`categories-${context}`] })
    },
  })

  const onSubmit = async (data: FormType) => {
    await mutation
      .mutateAsync(data)
      .then(() => {
        toast.success('Categoria salva')
        handleOpenChange(false)
      })
      .catch((err) => {
        toast.error(err.message)
      })
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen?.(openDialog ? 'edit' : '')
    setDialogOpen(openDialog)
    reset()
  }

  const categoryLabel = context === 'client' ? 'cliente' : 'fornecedor'

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {!editMode && (
        <DialogTrigger asChild>
          <Button type="button" LeftIcon={IconPlus}>
            Novo grupo
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
            <DialogTitle>
              {editMode ? 'Editar' : 'Novo'} grupo de {categoryLabel}
            </DialogTitle>
          </div>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="submit-form"
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-wrap gap-5"
              noValidate
            >
              <FormInput<FormType>
                name="name"
                label="Nome do grupo"
                width="flex-[1_0_100px]"
                maxLength={100}
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
