'use client'

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
import { FormTextarea } from '@/components/common/form/FormTextarea'

// Components
import { CashSummary } from '../../CashSummary'

// Third-party
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconCircleCheck } from '@tabler/icons-react'

// Form Imports
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { schema, defaultValues, type FormType } from './schema'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { CashControlType } from '@/types/financial/cashControl'

import { updateItem } from '@/actions/_cruds'

interface Props extends SearchParamsType {
  open: boolean
  setOpen: (value: string) => void
  rowData?: CashControlType
}

export function CloseCashDialog(props: Props) {
  const { open, setOpen, rowData } = props

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const { reset, handleSubmit } = form

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (body: FormType) =>
      updateItem('cashControlRoute', `close/${rowData?.id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries()
      toast.success('Caixa fechado!')
      handleOpenChange(false)
    },
    onError: () => {
      toast.error('Ocorreu um erro!')
    },
  })

  const onSubmit = async (data: FormType) => {
    await mutation.mutateAsync(data)
  }

  const handleOpenChange = (openDialog: boolean) => {
    if (!openDialog) {
      setOpen('')
      reset(defaultValues)
      return
    }
    setOpen('close')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[750px]">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center gap-4">
                  <FeaturedIcon
                    variant="neutralOutline"
                    Icon={IconCircleCheck}
                  />
                  <span>Fechar caixa</span>
                </div>
              </DialogTitle>
              <DialogDescription hidden></DialogDescription>
            </DialogHeader>
            <DialogBody className="space-y-8">
              <CashSummary data={rowData} />
              <Form {...form}>
                <form
                  id="change-transaction-value"
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                >
                  <div className="flex flex-wrap gap-5">
                    <FormTextarea<FormType>
                      name="notes"
                      label="Observação de fechamento"
                      rows={6}
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
                  RightIcon={IconCircleCheck}
                  isLoading={false}
                >
                  Fechar
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
