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

// Components
import { CashSummary } from '../../CashSummary'
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormBrlInput } from '@/components/common/form/FormBrlInput'

// Third-party
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconCircleCheck } from '@tabler/icons-react'

// Form Imports
import { schema, defaultValues, type FormType } from './schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { CashControlType } from '@/types/financial/cashControl'

// Actions
import { updateItem } from '@/actions/_cruds'

const options = [
  { value: 'motivo1', label: 'Motivo 1' },
  { value: 'motivo2', label: 'Motivo 2' },
]

interface Props extends SearchParamsType {
  open: boolean
  setOpen: (value: string) => void
  rowData?: CashControlType
}

export function EditCashDialog({ open, setOpen, rowData }: Props) {
  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const { reset, handleSubmit } = form

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (body: FormType) =>
      updateItem('cashControlRoute', `${rowData?.id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries()
      toast.success('Sucesso!')
      handleOpenChange(false)
    },
    onError: () => {
      toast.error('Ocorreu um erro!')
    },
  })

  const onSubmit = async (data: FormType) => {
    delete data.reason

    await mutation.mutateAsync(data)
  }

  const handleOpenChange = (openDialog: boolean) => {
    if (!openDialog) {
      setOpen('')
      reset(defaultValues)
      return
    }
    setOpen('edit')
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
                  <span>Editar caixa</span>
                </div>
              </DialogTitle>
              <DialogDescription hidden></DialogDescription>
            </DialogHeader>
            <DialogBody className="space-y-8">
              <CashSummary data={rowData} />
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <div className="flex flex-wrap gap-5">
                    <FormBrlInput
                      name="amount"
                      placeholder="0,00"
                      label="Valor"
                      startAdornment={<>R$</>}
                      width="flex-[1_1_100px]"
                    />
                    <FormSelect
                      name="type"
                      label="Ajustar em"
                      options={[
                        { value: 'INCOME', label: 'Receita' },
                        { value: 'OUTCOME', label: 'Despesa' },
                      ]}
                      width="flex-[1_1_100px]"
                    />
                    <FormSelect
                      name="reason"
                      label="Motivo"
                      options={options}
                      width="flex-[1_1_100px]"
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
