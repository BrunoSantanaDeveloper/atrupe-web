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
  AlertDialogTrigger,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { Form } from '@/components/ui/form'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Button } from '@/components/ui/button'

// Components
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormTextarea } from '@/components/common/form/FormTextarea'

// Third-party
import { useQueryClient } from '@tanstack/react-query'

// Types
import { TransactionDetailsType } from '@/types/financial/financialFlow'

// Icons
import { IconAlertTriangle } from '@tabler/icons-react'

// Actions
import { updateItemNew } from '@/actions/_cruds'

// Form
import { useForm } from 'react-hook-form'
import { FormType, schema, schemaWithReasons } from './schema'
import { zodResolver } from '@hookform/resolvers/zod'

import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { usePlanErrorToast } from '@/hooks/usePlanErrorToast'

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
  const queryClient = useQueryClient()
  const { canManageCancelTransactionReasons } = usePlanFeatures()
  const { notifyActionError } = usePlanErrorToast()

  const form = useForm<FormType>({
    resolver: zodResolver(
      canManageCancelTransactionReasons() ? schemaWithReasons : schema,
    ),
    defaultValues: {
      cancelReason: '',
      cancelNotes: '',
    },
  })

  const { handleSubmit, formState } = form

  const hasInstallments =
    rowData?.installments && rowData?.installments?.length > 1

  const canCancel = rowData?.installments?.some(
    (item) => item.status !== 'PAID',
  )

  const onSubmit = async (data: FormType) => {
    if (!rowData || !canCancel) return

    const res = await updateItemNew({
      route: `/financial/${type}/${rowData?.id}/cancel`,
      data,
    })

    if (!res.success) {
      // Informar motivo ao cancelar é recurso de plano: o servidor recusa o
      // motivo sem ele.
      notifyActionError(res)
      return
    }

    queryClient.invalidateQueries()
    toast.success('Movimentação cancelada')
    router.refresh()
    onTransactionCancel?.()
  }

  return (
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
              parcelas realizadas é preciso estornar seus valores manualmente,
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
              {canManageCancelTransactionReasons() && (
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
              )}
            </form>
          </Form>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          {canCancel && (
            <Button
              type="submit"
              form="cancel-transaction"
              variant="error"
              isLoading={formState.isSubmitting}
            >
              Cancelar movimentação
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
