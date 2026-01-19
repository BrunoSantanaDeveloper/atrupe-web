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
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormBrlInput } from '@/components/common/form/FormBrlInput'
import { FormDatePickerInput } from '@/components/common/form/FormDatePickerInput'
import { SelectBankAccountField } from '@/components/common/form/global-inputs/BankAccountSelectField'

// Icons
import { IconCircleCheck, IconArrowsRightLeft } from '@tabler/icons-react'

// Form
import { useForm } from 'react-hook-form'
import { createItem } from '@/actions/_cruds'
import { zodResolver } from '@hookform/resolvers/zod'
import { schema, defaultValues, type FormType } from './schema'

// Types
import { useMutation, useQueryClient } from '@tanstack/react-query'

// interface Props extends SearchParamsType {}

export function NewTransferDialog() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const { reset, handleSubmit } = form

  const mutation = useMutation({
    mutationFn: (data: FormType) =>
      createItem({
        route: 'cashControlRoute',
        customPath: '/transfer',
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries()
      handleOpenChange(false)
    },
  })

  const handleOpenChange = (openDialog: boolean) => {
    if (!openDialog) {
      reset(defaultValues)
    }
    setOpen(openDialog)
  }

  const onSubmit = (data: FormType) => {
    toast.promise(mutation.mutateAsync(data), {
      loading: 'Aguarde...',
      success: 'Transferência realizada com sucesso!',
      error: 'Ocorreu um erro ao realizar a transferência',
    })
  }

  const transferOptions = [
    { label: 'Opção 1', value: 'option1' },
    { label: 'Opção 2', value: 'option2' },
  ]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" LeftIcon={IconArrowsRightLeft}>
          Nova transferência
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[644px]">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center gap-4">
                  <FeaturedIcon
                    variant="neutralOutline"
                    Icon={IconArrowsRightLeft}
                  />
                  <span>Transferência entre contas</span>
                </div>
              </DialogTitle>
              <DialogDescription hidden></DialogDescription>
            </DialogHeader>
            <DialogBody>
              <div className="flex flex-wrap gap-5">
                <SelectBankAccountField
                  name="sourceBankAccountId"
                  label="Conta de origem"
                  width="flex-[1_1_280px]"
                />
                <SelectBankAccountField
                  name="targetBankAccountId"
                  label="Conta de destino"
                  width="flex-[1_1_280px]"
                />
                <FormSelect
                  name="transferMethod"
                  label="Forma de transferência"
                  options={transferOptions}
                  width="flex-[1_1_280px]"
                />
                <FormDatePickerInput
                  name="transferDate"
                  label="Data"
                  width="flex-[1_1_125px]"
                />
                <FormBrlInput
                  name="amount"
                  label="Valor"
                  width="flex-[1_1_125px]"
                  startAdornment={<>R$</>}
                />
              </div>
            </DialogBody>
            <DialogFooter className="sm:justify-between">
              <div></div>
              <div className="space-x-4">
                <DialogTrigger asChild>
                  <Button type="button" variant="neutralOutline">
                    Cancelar
                  </Button>
                </DialogTrigger>
                <Button
                  type="submit"
                  RightIcon={IconCircleCheck}
                  isLoading={mutation.isPending}
                >
                  Transferir e abrir
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
