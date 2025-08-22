'use client'

// Next
import { useRouter } from 'next/navigation'

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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Form } from '@/components/ui/form'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Button } from '@/components/ui/button'

// Components
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormTextarea } from '@/components/common/form/FormTextarea'

// Third-party
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Types
import { TransactionDetailsType } from '@/types/financial/financialFlow'

// Icons
import { IconAlertTriangle } from '@tabler/icons-react'

// Actions
import { updateItemNew } from '@/actions/_cruds'

// Form
import { useForm } from 'react-hook-form'
import { FormType, schema } from './schema'
import { zodResolver } from '@hookform/resolvers/zod'

const options = [
  { value: 'ERRO_INCLUSAO', label: 'Erro de inclusão' },
  { value: 'DUPLICIDADE', label: 'Duplicidade' },
  { value: 'PAGO_ESPECIE', label: 'Pago em espécie' },
  { value: 'OUTROS', label: 'Outros' },
]

interface Props {
  rowData?: TransactionDetailsType
  type?: 'receivable' | 'payable'
  onTransactionCancel?: () => void
}

export function CancelAlertDialog(props: Props) {
  const { rowData, type, onTransactionCancel } = props

  const router = useRouter()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      cancelReason: '',
      cancelNotes: '',
    },
  })

  const { handleSubmit } = form

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: FormType) =>
      updateItemNew({
        route: `/financial/${type}/${rowData?.id}/cancel`,
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries()
      toast.success('Movimentação cancelada!')
      router.refresh()
      onTransactionCancel?.()
    },
  })

  const hasInstallments =
    rowData?.installments && rowData?.installments?.length > 1

  const canCancel = rowData?.installments?.some(
    (item) => item.status !== 'PAID',
  )

  const onSubmit = async (data: FormType) => {
    if (!rowData || !canCancel) return

    await mutation.mutateAsync(data)
  }

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="error">
            Cancelar movimentação
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="w-full">
          <AlertDialogHeader>
            <FeaturedIcon
              Icon={IconAlertTriangle}
              rounded
              size="lg"
              variant="warningBorderedLight"
              className="mx-auto mb-2"
            />
            <AlertDialogTitle>Cancelar movimentação</AlertDialogTitle>
            {hasInstallments && canCancel && (
              <AlertDialogDescription>
                Apenas as parcelas não realizadas serão canceladas. Havendo
                parcelas realizadas é preciso extornar seus valores manualmente,
                se necessário. <br /> <br /> Deseja prosseguir?
              </AlertDialogDescription>
            )}
            {!canCancel && (
              <AlertDialogDescription>
                Esta movimentação não pode ser cancelada
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          {canCancel && (
            <Form {...form}>
              <form
                id="cancel-transaction"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                <div className="flex flex-wrap gap-5">
                  <FormSelect<FormType>
                    name="cancelReason"
                    label="Motivo"
                    options={options}
                    width="w-full"
                  />
                  <FormTextarea<FormType>
                    name="cancelNotes"
                    label="Observação"
                    rows={6}
                  />
                </div>
              </form>
            </Form>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            {canCancel && (
              <Button type="submit" form="cancel-transaction" variant="error">
                Cancelar movimentação
              </Button>
            )}
            {/* <AlertDialogAction
              type="submit"
              form="cancel-transaction"
              className={buttonVariants({ variant: 'error' })}
            >Cancelar movimentação</AlertDialogAction> */}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
