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
import { SelectEmployeeProfileField } from '@/components/common/form/global-inputs/EmployeeProfileSelectField'

// Icons
import { IconCircleCheck } from '@tabler/icons-react'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { defaultValues, schema, type FormType } from './schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { SellerProfileType } from '@/types/settings/sellerProfile'

// Actions
import { createItem } from '@/actions/_cruds'

interface Props extends SearchParamsType {
  open?: boolean
  setOpen?: (value: string) => void
  rowData?: SellerProfileType
}

export function AddSellerDialog({ open, setOpen, rowData }: Props) {
  const queryClient = useQueryClient()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const { handleSubmit, reset } = form

  const mutation = useMutation({
    mutationFn: (data: FormType) =>
      createItem({
        route: 'sellerProfileEmployeeRoute',
        customPath: `/${rowData?.id}`,
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries()
      toast.success('Vendedor adicionado')
      handleOpenChange(false)
    },
    onError: (err) => {
      console.error(err)
      toast.error('Ocorreu um erro.')
    },
  })

  const onSubmit = async (data: FormType) => {
    await mutation.mutateAsync(data)
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen?.(openDialog ? 'addSeller' : '')
    reset(defaultValues)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Adicionar vendedor</DialogTitle>
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
              <SelectEmployeeProfileField<FormType>
                name="employeeId"
                label="Vendedor"
                width="w-full"
              />
            </form>
          </Form>
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <div></div>
          <div className="space-x-4">
            <DialogTrigger asChild>
              <Button type="button" variant="neutralOutline">
                Voltar
              </Button>
            </DialogTrigger>
            <Button
              type="submit"
              form="submit-form"
              isLoading={mutation.isPending}
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
