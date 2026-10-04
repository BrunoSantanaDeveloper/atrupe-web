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
import { FormBrlInput } from '@/components/common/form/FormBrlInput'

// Icons
import { IconCircleCheck } from '@tabler/icons-react'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { schema, type FormType } from './schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { SellerProfileType } from '@/types/settings/sellerProfile'

// Actions
import { updateItem } from '@/actions/_cruds'
import { FormSwitch } from '@/components/common/form/FormSwitch'

interface Props extends SearchParamsType {
  open?: boolean
  setOpen?: (value: string) => void
  rowData?: SellerProfileType
}

export function ConfigureProfileDialog({ open, setOpen, rowData }: Props) {
  const queryClient = useQueryClient()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    values: {
      name: rowData?.name || '',
      commission: rowData?.commission || 0,
      maxDiscount: rowData?.maxDiscount || 0,
      minValue: rowData?.minValue || 0,
      canApprovePreRegistration: rowData?.canApprovePreRegistration || false,
      canCancelSale: rowData?.canCancelSale || false,
    },
  })

  const { handleSubmit, reset } = form

  const mutation = useMutation({
    mutationFn: (data: FormType) =>
      updateItem('sellerProfileRoute', rowData?.id || '', data),
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit = async (data: FormType) => {
    await mutation
      .mutateAsync(data)
      .then(() => {
        toast.success('Perfil configurado')
        handleOpenChange(false)
      })
      .catch((err) => {
        toast.error(err.message)
      })
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen?.(openDialog ? 'configure' : '')
    reset({})
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Configurar perfil do vendedor</DialogTitle>
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
                label="Nome do perfil"
                width="w-full"
              />
              <FormInput<FormType>
                type="number"
                name="commission"
                label="Comissão"
                width="flex-[1_0_140px]"
                endAdornment={<>%</>}
              />
              <FormInput<FormType>
                type="number"
                name="maxDiscount"
                label="Desconto máximo"
                width="flex-[1_0_140px]"
                endAdornment={<>%</>}
              />
              <FormBrlInput<FormType>
                name="minValue"
                label="Valor mínimo"
                width="flex-[1_0_140px]"
                startAdornment={<>R$</>}
              />
              <div className="flex flex-col w-full gap-5 p-6 border border-gray-300 rounded-xl bg-white">
                <FormSwitch<FormType>
                  name="canApprovePreRegistration"
                  label="Aprova pré-cadastro"
                  className="w-full"
                />
                <FormSwitch<FormType>
                  name="canCancelSale"
                  label="Cancela venda"
                  className="w-full"
                />
              </div>
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
              isLoading={form.formState.isSubmitting}
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
