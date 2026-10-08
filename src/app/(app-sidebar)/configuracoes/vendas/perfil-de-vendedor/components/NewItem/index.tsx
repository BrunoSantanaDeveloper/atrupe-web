'use client'

// React
import { useState } from 'react'

// UI
import { toast } from 'sonner'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'

// Components
import { FormInput } from '@/components/common/form/FormInput'

// Icons
import { IconPlus, IconCircleCheck } from '@tabler/icons-react'

// Form
import { useForm } from 'react-hook-form'
import { createItem } from '@/actions/_cruds'
import { zodResolver } from '@hookform/resolvers/zod'
import { defaultValues, schema, type FormType } from './schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// interface Props extends SearchParamsType {}

export function NewItemDialog() {
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const { reset, handleSubmit } = form

  const handleOpenChange = (openDialog: boolean) => {
    if (!openDialog) {
      reset(defaultValues)
    }
    setOpen(openDialog)
  }

  const mutation = useMutation({
    mutationFn: (data: FormType) =>
      createItem({
        route: 'sellerProfileRoute',
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit = async (data: FormType) => {
    await mutation
      .mutateAsync(data)
      .then(() => {
        toast.success('Perfil salvo')
        handleOpenChange(false)
      })
      .catch((err) => {
        toast.error(err.message)
      })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" LeftIcon={IconPlus}>
          Novo perfil
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[537px]">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <DialogHeader>
              <div className="flex items-center gap-4">
                <DialogTitle>Novo perfil</DialogTitle>
              </div>
              <DialogDescription hidden></DialogDescription>
            </DialogHeader>
            <DialogBody>
              <div className="grid gap-4 py-4">
                <FormInput<FormType>
                  name="name"
                  label="Nome do perfil"
                  width="flex-[1_0_300px]"
                />
              </div>
            </DialogBody>
            <DialogFooter>
              <div className="space-x-4">
                <DialogTrigger asChild>
                  <Button type="button" variant="neutralOutline">
                    Cancelar
                  </Button>
                </DialogTrigger>
                <Button
                  type="submit"
                  RightIcon={IconCircleCheck}
                  isLoading={false}
                >
                  Salvar
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
