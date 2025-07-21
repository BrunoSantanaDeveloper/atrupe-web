// React
import { useEffect, useMemo } from 'react'

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
import { FormBrlInput } from '@/components/common/form/FormBrlInput'
import { FormDatePickerSingle } from '@/components/common/form/FormDatePicker'
import { SelectBankAccountField } from '@/components/common/form/global-inputs/BankAccountSelectField'
import { SelectBankFilterMethodField } from '@/components/common/form/global-inputs/BanksFilterMethodSelectField'
import { SelectAvailablePaymentMethodField } from '@/components/common/form/global-inputs/AvailablePaymentMethodsSelectField'
import { SelectTransactionNatureField } from '@/components/common/form/global-inputs/TransactionNatureSelectField'
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
import type { InstallmentType } from '@/types/financial/financialFlow'

// Actions
import { updateItemNew } from '@/actions/_cruds'

// Hooks
import { useBankFilterMethod } from '@/hooks/queries/useBankFilterMethod'
import { useBankAccount } from '@/hooks/queries/useBankAccount'

// Lib
import { cn, formatCurrencyToBrl } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

interface Props {
  open: boolean
  setOpen: (value: string) => void
  rowData?: InstallmentType
  type?: 'receivable' | 'payable'
  transactionDialogOpen?: (open: boolean) => void
}

export function PaymentDialog({
  type,
  open,
  rowData,
  setOpen,
  transactionDialogOpen,
}: Props) {
  const form = useForm<FormType>({
    resolver: zodResolver(schema),
  })

  const { watch, reset, handleSubmit, formState, setValue } = form

  const queryClient = useQueryClient()

  const paymentMethodId = watch('paymentMethodId')
  const bankId = watch('bankId')
  const totalValue = watch('totalValue')
  const amount = watch('amount')
  const differenceNatureId = watch('differenceNatureId') || ''

  const { data: banks } = useBankFilterMethod(paymentMethodId || '')
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

  useEffect(() => {
    reset({
      paidDate: new Date(),
      paymentMethodId: rowData?.paymentMethod?.id || '',
      bankId: '',
      bankAccountId: '',
      totalValue: rowData?.value || 0,
      amount: rowData?.value || 0,
      differenceNatureId: '',
      differenceCategoryId: '',
    })
  }, [rowData, reset])

  useEffect(() => {
    if (banks && banks.length > 0 && paymentMethodId) {
      setValue('bankId', banks[0].id)
    }
  }, [banks, paymentMethodId, setValue])

  useEffect(() => {
    if (bankAccounts && bankAccounts.length > 0 && bankId) {
      setValue('bankAccountId', bankAccounts[0].id)
    }
  }, [bankAccounts, bankId, setValue])

  // Limpa a categoria quando a natureza é alterada
  useEffect(() => {
    setValue('differenceCategoryId', '')
  }, [differenceNatureId, setValue])

  const onSubmit = async (data: FormType) => {
    // Se há diferença, validar se os campos necessários foram preenchidos
    if (
      hasDifference &&
      (!data.differenceNatureId || !data.differenceCategoryId)
    ) {
      toast.error('Selecione a natureza e categoria para a diferença')
      return
    }

    delete data.totalValue
    delete data.bankId

    // Adicionar dados da diferença se necessário
    const submitData = {
      ...data,
      ...(hasDifference && {
        difference,
        differenceNatureId: data.differenceNatureId,
        differenceCategoryId: data.differenceCategoryId,
      }),
    }

    // Remover campos de diferença se não há diferença
    if (!hasDifference) {
      delete submitData.differenceNatureId
      delete submitData.differenceCategoryId
    }

    const response = await updateItemNew({
      route: `/financial/${type}/pay-installment/${rowData?.id}`,
      data: submitData,
    })

    if (response.success) {
      queryClient.invalidateQueries()
      toast.success('Pagamento confirmado!')
      handleOpenChange(false)
      transactionDialogOpen?.(false)
    } else {
      toast.error(response.message)
    }
  }

  const handlePrintReceipt = () => {
    window.open('/impressao', '_blank')
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
            <DialogTitle>Pagamento</DialogTitle>
          </div>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="edit-transaction-data"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-wrap gap-4"
            >
              <FormDatePickerSingle
                name="paidDate"
                label="Data do pagamento"
                width="flex-[1_0_250px]"
              />
              <SelectAvailablePaymentMethodField
                name="paymentMethodId"
                label="Forma de pagamento"
                width="flex-[1_0_250px]"
                type={type}
              />
              <SelectBankFilterMethodField
                name="bankId"
                label="Banco"
                width="flex-[1_0_250px]"
                methodId={watch('paymentMethodId')}
                disabled={!watch('paymentMethodId')}
              />
              <SelectBankAccountField
                name="bankAccountId"
                label="Conta"
                width="flex-[1_0_250px]"
                bankId={watch('bankId')}
                disabled={!watch('bankId')}
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
                label="Valor pago"
                startAdornment={<>R$</>}
                width="flex-[1_0_250px]"
              />

              {/* Seção de Diferença */}
              {hasDifference && (
                <div className="w-full p-4 border rounded-lg bg-gray-50">
                  <div
                    className={cn(
                      'flex justify-between gap-5 rounded-lg p-3 mb-4',
                      difference < 0
                        ? 'bg-error-200 text-error-900'
                        : 'bg-success-200 text-success-900',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <FeaturedIcon
                        variant={difference < 0 ? 'errorLight' : 'successLight'}
                        size="xs"
                        Icon={IconCornerRightDown}
                      />
                      <p className="text-sm font-medium">Saldo</p>
                    </div>
                    <p className="text-sm font-semibold">
                      {formatCurrencyToBrl(difference)}
                    </p>
                  </div>

                  <Separator className="my-5" />

                  <div className="flex flex-wrap gap-4">
                    <SelectTransactionNatureField
                      name="differenceNatureId"
                      label="Natureza"
                      width="flex-[1_0_250px]"
                      type={difference < 0 ? 'payable' : 'receivable'}
                    />
                    <SelectTransactionCategoryField
                      name="differenceCategoryId"
                      label="Categoria"
                      width="flex-[1_0_250px]"
                      natureId={differenceNatureId}
                    />
                  </div>
                </div>
              )}
            </form>
          </Form>
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <div>
            {type === 'receivable' && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrintReceipt}
              >
                Imprimir recibo
              </Button>
            )}
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
              Confirmar pagamento
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
