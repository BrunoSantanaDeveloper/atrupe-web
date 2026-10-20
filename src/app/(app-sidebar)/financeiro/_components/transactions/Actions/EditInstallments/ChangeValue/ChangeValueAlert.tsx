'use client'

// UI
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormTextarea } from '@/components/common/form/FormTextarea'

// Third-party
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Types
import { TransactionDetailsType } from '@/types/financial/financialFlow'

// Form
import { useForm } from 'react-hook-form'
import { FormType, schema } from './schema'
import { FormType as EditFormType } from '../schema'
import { zodResolver } from '@hookform/resolvers/zod'

// Actions
import { updateItemNew } from '@/actions/_cruds'

// Icons
import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react'
import { formatCurrencyToBrl } from '@/lib/utils'

const options = [
  { value: 'CORRECAO', label: 'Correção de valor' },
  { value: 'DESCONTO', label: 'Desconto' },
  { value: 'JUROS', label: 'Juros / Multa / Mora' },
  { value: 'OUTROS', label: 'Outros' },
]

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  rowData?: TransactionDetailsType
  type?: 'receivable' | 'payable'
  submitData: EditFormType
  onCloseParentDialog?: () => void
}

export function ChangeTotalValueAlertDialog(props: Props) {
  const { open, rowData, setOpen, type, submitData, onCloseParentDialog } =
    props

  const newTotal = submitData?.installments?.reduce(
    (acc, curr) => acc + curr.amount,
    0,
  )

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      changeReason: '',
      changeNotes: '',
    },
  })

  const { handleSubmit } = form

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: unknown) =>
      updateItemNew({
        route: `/financial/${type}/${rowData?.id}/upsert-installments`,
        data,
      }),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries()
        toast.success('Movimentação alterada')
        handleOpenChange(false)
        onCloseParentDialog?.()
      } else {
        toast.error(result.message || 'Ocorreu um erro!')
      }
    },
  })

  const onSubmit = async (data: FormType) => {
    if (!rowData || !submitData) return

    const body = {
      ...submitData,
      totalAmount: newTotal,
      changeReason: data.changeReason,
      changeNotes: data.changeNotes,
    }

    await mutation.mutateAsync(body)
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen(openDialog)
  }

  return (
    <>
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent className="w-full">
          <AlertDialogHeader>
            <FeaturedIcon
              Icon={IconAlertTriangle}
              size="lg"
              tone="warning"
              className="mx-auto mb-2 flex"
            />
            <AlertDialogTitle>Alterar valor do título?</AlertDialogTitle>
            <AlertDialogDescription>
              Ainda há saldo a repassar nas parcelas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center gap-8 sm:gap-16 p-4 sm:p-6 bg-gray-50 rounded-xl border border-gray-300">
            <div className="flex flex-col items-center">
              <p className="text-lg font-semibold">
                {formatCurrencyToBrl(rowData?.totalAmount)}
              </p>
              <p className="text-sm text-gray-600">Valor atual</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-lg font-semibold">
                {formatCurrencyToBrl(newTotal)}
              </p>
              <p className="text-sm text-gray-600">Valor novo</p>
            </div>
          </div>
          <Form {...form}>
            <form
              id="change-transaction-value"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <div className="flex flex-wrap gap-5">
                <FormSelect<FormType>
                  name="changeReason"
                  label="Motivo"
                  options={options}
                  width="w-full"
                />
                <FormTextarea<FormType>
                  name="changeNotes"
                  label="Observação"
                  rows={6}
                />
              </div>
            </form>
          </Form>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              type="submit"
              form="change-transaction-value"
              RightIcon={IconCircleCheck}
              isLoading={mutation.isPending}
            >
              Alterar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
