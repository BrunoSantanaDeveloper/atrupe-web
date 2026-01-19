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
import { FormDatePickerInput } from '@/components/common/form/FormDatePickerInput'
import { SelectBankAccountField } from '@/components/common/form/global-inputs/BankAccountSelectField'

// Icons
import { IconArrowRight, IconCalendarPlus } from '@tabler/icons-react'

// Form
import { schema, defaultValues, type FormType } from './schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Query
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Actions
import { createItem } from '@/actions/_cruds'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

interface Props extends SearchParamsType {}

export function OpenCashDialog(props: Props) {
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
        customPath: '/open',
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
    console.info('❗', props)
    toast.promise(mutation.mutateAsync(data), {
      loading: 'Aguarde...',
      success: 'Sucesso!',
      error: 'Ocorreu um erro',
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="neutralOutline"
          LeftIcon={IconCalendarPlus}
        >
          Abrir caixa para outra data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[537px]">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center gap-4">
                  <FeaturedIcon
                    variant="neutralOutline"
                    Icon={IconCalendarPlus}
                  />
                  <span>Abrir caixa</span>
                </div>
              </DialogTitle>
              <DialogDescription hidden></DialogDescription>
            </DialogHeader>
            <DialogBody>
              <div className="flex flex-wrap gap-5">
                <SelectBankAccountField
                  name="bankAccountId"
                  width="flex-[1_0_200px]"
                  isBankRequired={false}
                  emptyMessage="Vazio"
                />
                <FormDatePickerInput
                  name="openingDate"
                  label="Data de abertura"
                  width="flex-[1_0_100px]"
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
                  RightIcon={IconArrowRight}
                  isLoading={mutation.isPending}
                >
                  Abrir
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
