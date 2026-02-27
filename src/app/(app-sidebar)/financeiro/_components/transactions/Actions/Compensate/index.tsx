// React
import { useEffect } from 'react'

// UI
import { toast } from 'sonner'
import {
  Dialog,
  DialogBody,
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
import { UnpayInstallment } from '../UnpayInstallment'
import { PrintReceiptButton } from '../PrintReceiptButton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FormBrlInput } from '@/components/common/form/FormBrlInput'
import { FormDatePickerInput } from '@/components/common/form/FormDatePickerInput'
import { SelectBankAccountField } from '@/components/common/form/global-inputs/BankAccountSelectField'
import { SelectBankFilterConditionField } from '@/components/common/form/global-inputs/BanksFilterConditionSelectField'
import { AvailablePaymentConditionsSelectField } from '@/components/common/form/global-inputs/AvailablePaymentConditionsSelectField'

// Form
import { useForm } from 'react-hook-form'
import { schema, type FormType } from './schema'
import { zodResolver } from '@hookform/resolvers/zod'

// Third-party
import { useQueryClient } from '@tanstack/react-query'

// Icons
import { IconCircleCheck, IconThumbUp } from '@tabler/icons-react'

// Types
import type {
  InstallmentType,
  TransactionListType,
} from '@/types/financial/financialFlow'

// Actions
import { updateItemNew } from '@/actions/_cruds'

// Hooks
import { useBankAccount } from '@/hooks/queries/useBankAccount'
import { useBankFilterCondition } from '@/hooks/queries/useBankFilterCondition'

interface Props {
  open: boolean
  setOpen: (value: string) => void
  rowData?: InstallmentType
  type?: 'receivable' | 'payable'
  transactionDialogOpen?: (open: boolean) => void
  transactionData?: TransactionListType
  triggerLoading?: () => void
}

export function CompensateDialog({
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

  const { watch, reset, setValue, handleSubmit, formState } = form

  const queryClient = useQueryClient()

  const paymentConditionId = watch('paymentConditionId')
  const bankId = watch('bankId')

  const { data: banks } = useBankFilterCondition(paymentConditionId || '')
  const { data: bankAccounts } = useBankAccount({
    filters: { bankId: bankId || undefined },
    isBankRequired: true,
  })

  useEffect(() => {
    if (!rowData || !open) {
      reset({})
      return
    }

    reset({
      paidDate: rowData?.paymentDate
        ? new Date(rowData?.paymentDate)
        : undefined,
      compensateDate: new Date(),
      paymentConditionId: rowData?.paymentCondition?.id || '',
      bankId: '',
      bankAccountId: '',
      totalValue: rowData?.value || 0,
      amount: rowData?.paidValue || 0,
    })
  }, [open, rowData, reset])

  // Seleciona automaticamente o banco quando há método de pagamento e bancos disponíveis
  useEffect(() => {
    if (banks && banks.length > 0 && paymentConditionId && !bankId) {
      const defaultBank = rowData?.bank?.id
        ? banks.find((bank) => bank.id === rowData.bank?.id)
        : banks[0]

      if (defaultBank) {
        setValue('bankId', defaultBank.id)
      }
    }
  }, [banks, paymentConditionId, setValue, bankId, rowData?.bank?.id])

  // Seleciona automaticamente a conta quando há banco e contas disponíveis
  useEffect(() => {
    if (bankAccounts && bankAccounts.length > 0 && bankId) {
      const defaultAccount = rowData?.bankAccount?.id
        ? bankAccounts.find((account) => account.id === rowData.bankAccount?.id)
        : bankAccounts[0]

      if (defaultAccount) {
        setValue('bankAccountId', defaultAccount.id)
      }
    }
  }, [bankAccounts, bankId, setValue, rowData?.bankAccount?.id])

  const onSubmit = async (data: FormType) => {
    if (!rowData?.id || !type) return

    const result = await updateItemNew({
      route: `/financial/${type}/compensate/${rowData?.id}`,
      data: { paidDate: data.paidDate },
    })

    if (!result.success) {
      toast.error(result.message)
      return
    }

    triggerLoading?.()

    queryClient.invalidateQueries()
    toast.success(
      `${type === 'payable' ? 'Pagamento compensado!' : 'Recebimento compensado!'}`,
    )
    handleOpenChange(false)
    transactionDialogOpen?.(false)
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
                {`${transactionData?.client?.name || transactionData?.supplier?.name || transactionData?.employee?.name} - ${transactionData?.description}`}
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
                width="flex-[1_0_150px]"
                disabled
              />
              <FormDatePickerInput
                name="compensateDate"
                label="Data da compensação"
                width="flex-[1_0_150px]"
              />
              <AvailablePaymentConditionsSelectField
                name="paymentConditionId"
                label="Condição de pagamento"
                width="flex-[1_0_150px]"
                type={type}
                disabled
              />
              <SelectBankFilterConditionField
                name="bankId"
                label="Banco"
                width="flex-[1_0_250px]"
                conditionId={watch('paymentConditionId') || ''}
                disabled
              />
              <SelectBankAccountField
                name="bankAccountId"
                label="Conta"
                width="flex-[1_0_250px]"
                bankId={watch('bankId') || ''}
                disabled
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
                disabled
              />
            </form>
          </Form>
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <div>
            <PrintReceiptButton type={type} installmentId={rowData?.id} />
          </div>
          <div className="space-x-4">
            <PermissionGate permissions={['financial:flow:edit']}>
              <UnpayInstallment
                type={type}
                rowData={rowData}
                handleOpenChange={handleOpenChange}
              />
            </PermissionGate>
            <Button
              type="submit"
              form="edit-transaction-data"
              RightIcon={IconCircleCheck}
              isLoading={formState.isSubmitting}
            >
              Compensar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
