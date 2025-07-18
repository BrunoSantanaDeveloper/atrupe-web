// React
import { useEffect } from 'react'

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

// Form
import { useForm } from 'react-hook-form'
import { schema, type FormType } from './schema'
import { zodResolver } from '@hookform/resolvers/zod'

// Third-party
import { useQueryClient } from '@tanstack/react-query'

// Icons
import { IconCircleCheck, IconThumbUp } from '@tabler/icons-react'

// Types
import type { InstallmentType } from '@/types/financial/financialFlow'

// Actions
import { updateItemNew } from '@/actions/_cruds'

// Hooks
import { useBankFilterMethod } from '@/hooks/queries/useBankFilterMethod'
import { useBankAccount } from '@/hooks/queries/useBankAccount'

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

  const { data: banks } = useBankFilterMethod(paymentMethodId || '')
  const { data: bankAccounts } = useBankAccount({
    filters: { bankId },
    isBankRequired: true,
  })

  useEffect(() => {
    reset({
      paidDate: new Date(),
      paymentMethodId: rowData?.paymentMethod?.id || '',
      bankId: '',
      bankAccountId: '',
      totalValue: rowData?.value || 0,
      amount: rowData?.value || 0,
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

  const onSubmit = async (data: FormType) => {
    delete data.totalValue
    delete data.bankId

    const response = await updateItemNew({
      route: `/financial/${type}/pay-installment/${rowData?.id}`,
      data,
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
                disabled
              />
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
