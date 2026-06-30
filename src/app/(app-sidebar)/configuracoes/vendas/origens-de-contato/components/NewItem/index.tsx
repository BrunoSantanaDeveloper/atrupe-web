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
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'

// Components
import { FormInput } from '@/components/common/form/FormInput'

// Icons
import { IconCircleCheck } from '@tabler/icons-react'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { defaultValues, schema, type FormType } from './schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Actions
import { createItem, updateItem } from '@/actions/_cruds'

// Types
import type { IContactSource } from '@/hooks/queries/useContactSources'

interface Props {
  editMode?: boolean
  open?: boolean
  setOpen?: (value: string) => void
  rowData?: IContactSource
}

export function NewItemDialog({ open, rowData, setOpen, editMode }: Props) {
  const queryClient = useQueryClient()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues,
    values: editMode ? { name: rowData?.name || '' } : undefined,
  })

  const { handleSubmit, reset } = form

  const mutation = useMutation({
    mutationFn: (data: FormType) =>
      editMode
        ? updateItem('contactSourceRoute', rowData?.id || '', data)
        : createItem({ route: 'contactSourceRoute', data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-sources-list'] })
    },
  })

  const onSubmit = async (data: FormType) => {
    if (editMode && !rowData) return

    await mutation
      .mutateAsync(data)
      .then(() => {
        toast.success('Sucesso!')
        handleOpenChange(false)
      })
      .catch((err) => {
        toast.error(err.message)
      })
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen?.(openDialog ? 'edit' : '')
    reset(defaultValues)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {editMode ? 'Editar' : 'Nova'} origem de contato
          </DialogTitle>
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
              <FormInput<FormType> name="name" label="Nome" width="w-full" />
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
