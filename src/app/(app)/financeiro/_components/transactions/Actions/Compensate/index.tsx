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
import { FormBrlInput } from '@/components/common/form/FormBrlInput'
import { FormDatePickerSingle } from '@/components/common/form/FormDatePicker'
import { SelectBankAccountField } from '@/components/common/form/global-inputs/BankAccountSelectField'
import { SelectPaymentMethodField } from '@/components/common/form/global-inputs/PaymentMethodsSelectField'
import { SelectBankFilterMethodField } from '@/components/common/form/global-inputs/BanksFilterMethodSelectField'

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

// Utils
import { useEffect } from 'react'

interface Props {
  open: boolean
  setOpen: (value: string) => void
  rowData?: InstallmentType
  type?: 'receivable' | 'payable'
  transactionDialogOpen?: (open: boolean) => void
}

export function CompensateDialog({
  type,
  open,
  rowData,
  setOpen,
  transactionDialogOpen,
}: Props) {
  const form = useForm<FormType>({
    resolver: zodResolver(schema),
  })

  const { watch, reset, setValue, handleSubmit } = form

  const queryClient = useQueryClient()

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
      paymentMethodId: rowData?.paymentMethod?.id || '',
      bankId: rowData?.bank?.id || '',
      bankAccountId: rowData?.bankAccount?.id || '',
      totalValue: rowData?.value || 0,
      amount: rowData?.paidValue || 0,
    })

    const timeoutId = setTimeout(() => {
      setValue('bankAccountId', rowData?.bankAccount?.id || '')
    }, 2000)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, rowData])

  const onSubmit = async (data: FormType) => {
    if (!rowData?.id || !type) return

    const result = await updateItemNew({
      route: `/financial/${type}/compensate/${rowData?.id}`,
      data,
    })

    if (!result.success) {
      toast.error(result.message)
      return
    }

    queryClient.invalidateQueries()
    toast.success('Pagamento confirmado!')
    handleOpenChange(false)
    transactionDialogOpen?.(false)
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
                width="flex-[1_0_150px]"
                disabled
              />
              <FormDatePickerSingle
                name="compensateDate"
                label="Data da compensação"
                width="flex-[1_0_150px]"
              />
              <SelectPaymentMethodField
                name="paymentMethodId"
                label="Forma de pagamento"
                width="flex-[1_0_150px]"
                disabled
              />
              <SelectBankFilterMethodField
                name="bankId"
                label="Banco"
                width="flex-[1_0_250px]"
                methodId={watch('paymentMethodId') || ''}
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
            <UnpayInstallment
              type={type}
              rowData={rowData}
              handleOpenChange={handleOpenChange}
            />
            <Button
              type="submit"
              form="edit-transaction-data"
              RightIcon={IconCircleCheck}
              isLoading={queryClient.isMutating() > 0}
            >
              Compensar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
