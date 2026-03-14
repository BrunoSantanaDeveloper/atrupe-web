// React
import { useEffect, useMemo, useRef } from 'react'

// UI
import { toast } from 'sonner'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { Separator } from '@/components/ui/separator'
import { PrintReceiptButton } from '../PrintReceiptButton'
import { FormBrlInput } from '@/components/common/form/FormBrlInput'
import { FormDatePickerInput } from '@/components/common/form/FormDatePickerInput'
import { SelectBankAccountField } from '@/components/common/form/global-inputs/BankAccountSelectField'
import { SelectBankFilterConditionField } from '@/components/common/form/global-inputs/BanksFilterConditionSelectField'
import { SelectTransactionNatureField } from '@/components/common/form/global-inputs/TransactionNatureSelectField'
import { AvailablePaymentConditionsSelectField } from '@/components/common/form/global-inputs/AvailablePaymentConditionsSelectField'
import { SelectTransactionCategoryField } from '@/components/common/form/global-inputs/TransactionCategorySelectField'

// Form
import { useForm } from 'react-hook-form'
import { schema, type FormType } from './schema'
import { zodResolver } from '@hookform/resolvers/zod'

// Third-party
import { useQueryClient } from '@tanstack/react-query'

// Icons
import {
  IconCircleCheck,
  IconThumbUp,
  IconCornerRightDown,
} from '@tabler/icons-react'

// Types
import type {
  InstallmentType,
  TransactionListType,
} from '@/types/financial/financialFlow'

// Actions
import { updateItemNew } from '@/actions/_cruds'

// Hooks
import { useAlertDialog } from '@/store/useAlertDialog'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { useBankAccount } from '@/hooks/queries/useBankAccount'
import { useBankFilterCondition } from '@/hooks/queries/useBankFilterCondition'

// Lib
import { cn, formatCurrencyToBrl } from '@/lib/utils'

interface Props {
  open: boolean
  setOpen: (value: string) => void
  rowData?: InstallmentType
  transactionData?: TransactionListType
  type?: 'receivable' | 'payable'
  transactionDialogOpen?: (open: boolean) => void
  triggerLoading?: () => void
}

export function PaymentDialog({
  type,
  open,
  rowData,
  transactionData,
  setOpen,
  transactionDialogOpen,
  triggerLoading,
}: Props) {
  const form = useForm<FormType>({
    resolver: zodResolver(schema),
  })

  const { watch, reset, handleSubmit, formState, setValue } = form

  const queryClient = useQueryClient()

  const alertDialog = useAlertDialog()

  const { canCreatePaymentDifference, canCreateBankAccount } = usePlanFeatures()

  const paymentConditionId = watch('paymentConditionId') || ''
  const bankId = watch('bankId') || ''
  const bankAccountId = watch('bankAccountId') || ''
  const totalValue = watch('totalValue') || 0
  const amount = watch('amount') || 0
  const differenceNatureId = watch('differenceNatureId') || ''

  const { data: banks } = useBankFilterCondition(paymentConditionId)

  const { data: bankAccounts } = useBankAccount({
    filters: { bankId },
    isBankRequired: true,
  })

  // Calcula a diferença entre valor pago e valor original
  const difference = useMemo(() => {
    if (!totalValue || !amount) return 0
    return amount - totalValue
  }, [totalValue, amount])

  // Se há diferença, determina se os campos de centro de custos são obrigatórios
  const hasDifference = difference !== 0

  // Calcula o tipo da diferença atual
  const differenceType = useMemo(() => {
    if (difference === 0) return null
    return (type === 'payable' && difference > 0) ||
      (type === 'receivable' && difference < 0)
      ? 'payable'
      : 'receivable'
  }, [difference, type])

  // Ref para rastrear o tipo anterior da diferença
  const previousDifferenceTypeRef = useRef<string | null>(null)

  useEffect(() => {
    if (open) {
      reset({
        paidDate: new Date(),
        paymentConditionId: rowData?.paymentCondition?.id || '',
        bankId: rowData?.bank?.id || rowData?.bankAccount?.bank?.id,
        bankAccountId: rowData?.bankAccount?.id,
        totalValue: rowData?.value || 0,
        amount: rowData?.value || 0,
        differenceNatureId: '',
        differenceCategoryId: '',
      })

      // Sistema de retry para definir bankAccountId
      const setBankAccountWithRetry = (delay: number) => {
        setTimeout(() => {
          const formBankAccountId = watch('bankAccountId')

          if (!formBankAccountId && rowData?.bankAccount?.id) {
            setValue('bankAccountId', rowData.bankAccount.id)
            // Se ainda não definiu, tenta novamente após 200ms
            setBankAccountWithRetry(200)
          }
        }, delay)
      }

      // Inicia com 100ms
      setBankAccountWithRetry(100)

      // Reset do ref quando modal abre
      previousDifferenceTypeRef.current = null
    }
  }, [open, rowData, reset, setValue, watch])

  // Só atribui o primeiro banco se NÃO havia valor inicial no rowData
  useEffect(() => {
    const initialBankId = rowData?.bank?.id || rowData?.bankAccount?.bank?.id

    if (
      banks &&
      banks.length > 0 &&
      paymentConditionId &&
      !bankId &&
      !initialBankId
    ) {
      setValue('bankId', banks[0].id)
    }
  }, [banks, paymentConditionId, setValue, bankId, rowData])

  // Só atribui a primeira conta se NÃO havia valor inicial no rowData
  useEffect(() => {
    const initialBankAccountId = rowData?.bankAccount?.id

    if (
      bankAccounts &&
      bankAccounts.length > 0 &&
      bankId &&
      !bankAccountId &&
      !initialBankAccountId
    ) {
      setValue('bankAccountId', bankAccounts[0].id)
    }
  }, [bankAccounts, bankId, setValue, bankAccountId, rowData])

  // Limpa a categoria quando a natureza é alterada
  useEffect(() => {
    setValue('differenceCategoryId', '')
  }, [differenceNatureId, setValue])

  // Limpa natureza e categoria quando o tipo da diferença muda (receita/despesa)
  useEffect(() => {
    if (
      previousDifferenceTypeRef.current !== null &&
      previousDifferenceTypeRef.current !== differenceType &&
      differenceType !== null
    ) {
      setValue('differenceNatureId', '')
      setValue('differenceCategoryId', '')
    }
    previousDifferenceTypeRef.current = differenceType
  }, [differenceType, setValue])

  const paymentLabel = type === 'payable' ? 'Valor pago' : 'Valor recebido'

  const submitPayment = async (data: FormType) => {
    delete data.totalValue
    delete data.bankId

    // Adicionar dados da diferença se necessário (apenas se tem feature)
    const submitData = {
      ...data,
      ...(hasDifference &&
        canCreatePaymentDifference() && {
          difference,
          differenceNatureId: data.differenceNatureId,
          differenceCategoryId: data.differenceCategoryId,
        }),
    }

    // Remover campos de diferença se não há diferença ou não tem feature
    if (!hasDifference || !canCreatePaymentDifference()) {
      delete submitData.differenceNatureId
      delete submitData.differenceCategoryId
    }

    const response = await updateItemNew({
      route: `/financial/${type}/pay-installment/${rowData?.id}`,
      data: submitData,
    })

    if (response.success) {
      queryClient.invalidateQueries()
      toast.success(
        `${type === 'payable' ? 'Pagamento confirmado!' : 'Recebimento confirmado!'}`,
      )
      handleOpenChange(false)
      transactionDialogOpen?.(false)
      triggerLoading?.()
    } else {
      toast.error(response.message)
    }
  }

  const onSubmit = async (data: FormType) => {
    if (hasDifference && !canCreatePaymentDifference()) {
      const confirmed = await alertDialog.open({
        title: 'Alterar valor?',
        description: `O ${paymentLabel.toLowerCase()} é diferente do valor da parcela. Deseja alterar o valor da movimentação?`,
        cancelLabel: 'Voltar',
        confirmLabel: 'Alterar',
        confirmVariant: 'default',
        toastMsg: {
          loading: `Aguarde...`,
          success: `Valor alterado!`,
          error: `Erro ao processar ${type === 'payable' ? 'pagamento' : 'recebimento'}.`,
        },
      })

      if (!confirmed) return
    }

    // Se há diferença e tem feature, validar se os campos necessários foram preenchidos
    if (
      hasDifference &&
      canCreatePaymentDifference() &&
      (!data.differenceNatureId || !data.differenceCategoryId)
    ) {
      toast.error('Selecione a natureza e categoria para a diferença')
      return
    }

    await submitPayment(data)
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen(openDialog ? 'payment' : '')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[644px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconThumbUp} />
            <div className="min-w-0">
              <DialogTitle className="mb-1">
                {type === 'payable' ? 'Pagamento' : 'Recebimento'}
              </DialogTitle>
              <DialogDescription className="truncate">
                {`${transactionData?.client?.name || transactionData?.supplier?.name || transactionData?.employee?.name || ''} - ${transactionData?.description || ''}`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="edit-transaction-data"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-wrap gap-4"
            >
              <FormDatePickerInput
                name="paidDate"
                label={
                  type === 'payable'
                    ? 'Data do pagamento'
                    : 'Data do recebimento'
                }
                width="flex-[1_0_250px]"
              />
              <AvailablePaymentConditionsSelectField
                name="paymentConditionId"
                label="Forma de pagamento"
                width="flex-[1_0_250px]"
                type={type}
              />
              <SelectBankFilterConditionField
                name="bankId"
                label="Banco"
                width="flex-[1_0_250px]"
                conditionId={watch('paymentConditionId')}
                disabled={
                  !watch('paymentConditionId') || !canCreateBankAccount()
                }
              />
              <SelectBankAccountField
                name="bankAccountId"
                label="Conta"
                width="flex-[1_0_250px]"
                bankId={watch('bankId')}
                disabled={!watch('bankId') || !canCreateBankAccount()}
              />
              <FormBrlInput
                name="totalValue"
                placeholder="0,00"
                label="Valor"
                startAdornment={<>R$</>}
                width="flex-[1_0_250px]"
                disabled
              />
              <FormBrlInput
                name="amount"
                placeholder="0,00"
                label={type === 'payable' ? 'Valor pago' : 'Valor recebido'}
                startAdornment={<>R$</>}
                width="flex-[1_0_250px]"
              />

              {/* Seção de Diferença */}
              {hasDifference && (
                <div className="w-full p-4 border rounded-lg bg-gray-50">
                  <div
                    className={cn(
                      'flex justify-between gap-5 rounded-lg p-3',
                      (type === 'payable' && difference > 0) ||
                        (type === 'receivable' && difference < 0)
                        ? 'bg-error-200 text-error-900'
                        : 'bg-success-200 text-success-900',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <FeaturedIcon
                        variant={
                          (type === 'payable' && difference > 0) ||
                          (type === 'receivable' && difference < 0)
                            ? 'errorLight'
                            : 'successLight'
                        }
                        size="xs"
                        Icon={IconCornerRightDown}
                      />
                      <p className="text-sm font-medium">Saldo</p>
                    </div>
                    <p className="text-sm font-semibold">
                      {formatCurrencyToBrl(difference)}
                    </p>
                  </div>

                  {canCreatePaymentDifference() && (
                    <>
                      <Separator className="my-5" />

                      <div className="flex flex-wrap gap-4">
                        <SelectTransactionNatureField
                          name="differenceNatureId"
                          label="Natureza"
                          width="flex-[1_0_250px]"
                          type={
                            (type === 'payable' && difference > 0) ||
                            (type === 'receivable' && difference < 0)
                              ? 'payable'
                              : 'receivable'
                          }
                        />
                        <SelectTransactionCategoryField
                          name="differenceCategoryId"
                          label="Categoria"
                          width="flex-[1_0_250px]"
                          natureId={differenceNatureId}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </form>
          </Form>
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <div>
            <PrintReceiptButton
              type={type}
              installmentId={rowData?.id}
              paidDate={watch('paidDate')}
            />
          </div>
          <div className="space-x-4">
            <DialogClose asChild>
              <Button type="button" variant="neutralOutline">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              form="edit-transaction-data"
              RightIcon={IconCircleCheck}
              isLoading={formState.isSubmitting}
            >
              {type === 'payable'
                ? 'Confirmar pagamento'
                : 'Confirmar recebimento'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
