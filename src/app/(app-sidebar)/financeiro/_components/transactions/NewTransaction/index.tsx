'use client'

// React
import { useCallback, useEffect, useState } from 'react'

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
import { InstallmentsForm } from './InstallmentsForm'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSwitch } from '@/components/common/form/FormSwitch'
import { FormTextarea } from '@/components/common/form/FormTextarea'
import { FormDatePickerSingle } from '@/components/common/form/FormDatePicker'
import { ClientSelector } from '@/components/common/form/global-inputs/ClientAsyncSelect'
import { SupplierSelector } from '@/components/common/form/global-inputs/SupplierAsyncSelect'
import { SelectTransactionNatureField } from '@/components/common/form/global-inputs/TransactionNatureSelectField'
import { PaymentConditionsSelectField } from '@/components/common/form/global-inputs/PaymentConditionsSelectField'
import { SelectTransactionCategoryField } from '@/components/common/form/global-inputs/TransactionCategorySelectField'

// Icons
import {
  IconTrendingUp,
  IconCircleCheck,
  IconTrendingDown,
} from '@tabler/icons-react'

// Form Imports
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'
import {
  schema,
  defaultValues,
  type FormType,
  MAX_INSTALLMENTS_ALLOWED,
} from './schema'

// Third-party
import { addMonths } from 'date-fns'

// Lib
import { cn } from '@/lib/utils'
import { createItem } from '@/actions/_cruds'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Types
import { SearchParamsType } from '@/types/coreTypes'
import { FormBrlInput } from '@/components/common/form/FormBrlInput'

interface Props extends SearchParamsType {
  type: 'receivable' | 'payable'
}

export function NewTransaction({ type }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [balance, setBalance] = useState(0)

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const {
    watch,
    reset,
    control,
    setValue,
    setError,
    getValues,
    clearErrors,
    handleSubmit,
  } = form

  const { append, fields, remove } = useFieldArray({
    name: 'installments',
    control,
  })

  const totalValue = watch('totalValue') || 0
  const installments = watch('installments')
  const installmentQty = watch('installmentQty')

  const handleInstallmentsQuantity = (quantity: number) => {
    if (quantity > 1) setValue('received', false)

    if (quantity > fields.length) {
      for (let i = fields.length; i < quantity; i++) {
        append({
          dueDate: addMonths(new Date(getValues('dueDate') || ''), i),
          paymentConditionId: getValues('paymentConditionId') || '',
          amount: 0,
        })
      }
    } else if (quantity < fields.length) {
      for (let i = fields.length; i > quantity; i--) {
        remove(i - 1)
      }
    }
  }

  // Setar os valores das parcelas com base na quantidade de parcelas
  useEffect(() => {
    if (totalValue) {
      // Dividir o valor total pelo número de parcelas (já em centavos)
      const baseInstallmentValue = Math.floor(totalValue / installmentQty)

      // Calcular o valor restante (em centavos)
      const remainder = totalValue - baseInstallmentValue * fields.length

      // Distribuir os valores nas parcelas
      fields.forEach((_, index) => {
        const installmentValue =
          index === 0
            ? baseInstallmentValue + remainder // Adiciona o resto à primeira parcela
            : baseInstallmentValue

        setValue(`installments.${index}.amount`, installmentValue)
      })
      handleRefreshBalance()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalValue, installmentQty])

  const handleOpenChange = (openDialog: boolean) => {
    if (!openDialog) {
      reset(defaultValues)
    }
    setDialogOpen(openDialog)
  }

  // Set remaining balance
  const handleRefreshBalance = useCallback(() => {
    const installmentsTotalValue = installments.reduce(
      (acc, field) => acc + field.amount,
      0,
    )

    const newBalance = totalValue - installmentsTotalValue

    setBalance(newBalance)
    clearErrors('totalValue')
    return newBalance
  }, [totalValue, installments, clearErrors])

  const queryClient = useQueryClient()

  const mutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: (data: any) => createItem({ route: `${type}Route`, data }),
    onSuccess: () => {
      queryClient.invalidateQueries()
      handleOpenChange(false)
      toast.success('Sucesso')
    },
  })

  const onSubmit = async (data: FormType) => {
    if (handleRefreshBalance() !== 0) {
      setError('totalValue', {
        type: 'custom',
        message: 'Ainda há saldo a repassar nas parcelas',
      })

      const div = document.getElementById('installments')

      if (div) {
        div.scrollIntoView()
      }

      return
    }

    const body = {
      referenceDate: data.referenceDate,
      description: data.description,
      notes: data.notes,
      clientId: type === 'receivable' ? data.clientOrSupplierId : undefined,
      supplierId: type === 'payable' ? data.clientOrSupplierId : undefined,
      installmentQty: data.installmentQty,
      installments: data.installments,
      subCategoryId: data.subCategoryId,
      natureId: data.natureId,
    }

    if (data.received && data.installmentQty === 1) {
      body.installments[0].status = 'PAID'
      body.installments[0].paidDate = new Date()
    }

    await mutation.mutateAsync(body)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={type === 'receivable' ? 'success' : 'error'}
          LeftIcon={type === 'receivable' ? IconTrendingUp : IconTrendingDown}
        >
          {type === 'receivable' ? 'Nova receita' : 'Nova despesa'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[950px]">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center gap-4">
                  <FeaturedIcon
                    variant={type === 'receivable' ? 'success' : 'error'}
                    Icon={
                      type === 'receivable' ? IconTrendingUp : IconTrendingDown
                    }
                  />
                  <span>
                    {type === 'receivable' ? 'Nova receita' : 'Nova despesa'}
                  </span>
                </div>
              </DialogTitle>
              <DialogDescription hidden></DialogDescription>
            </DialogHeader>
            <div className="flex flex-wrap">
              <FormBrlInput
                name="totalValue"
                placeholder="0,00"
                startAdornment={<p className="text-2xl">R$</p>}
                width="w-full [&_.form-message]:ml-auto [&_.form-message]:mr-6 [&_.form-message]:pb-2"
                className={cn(
                  'border-0 focus-within:ring-0 rounded-sm border-b-2 text-5xl font-medium h-20 [&>input]:text-right px-3',
                  type === 'receivable'
                    ? 'text-success-800 border-success-600 bg-success-25 [&>input]:placeholder:text-success-800'
                    : 'text-error-700 border-error-600 focus-within:border-error-600 bg-error-25 [&>input]:placeholder:text-error-800',
                )}
              />
              <DialogBody className="max-h-[calc(100vh-320px)]">
                <div className="flex flex-wrap gap-5">
                  {type === 'receivable' ? (
                    <ClientSelector
                      name="clientOrSupplierId"
                      label="Cliente"
                      width="flex-[1_0_300px]"
                    />
                  ) : (
                    <SupplierSelector
                      name="clientOrSupplierId"
                      label="Cliente"
                      width="flex-[1_0_300px]"
                    />
                  )}
                  <FormInput
                    name="description"
                    label="Descrição"
                    width="flex-[1_0_300px]"
                  />
                  <SelectTransactionNatureField
                    name="natureId"
                    label="Natureza"
                    width="flex-[1_0_280px]"
                    type={type}
                  />
                  <SelectTransactionCategoryField
                    name="subCategoryId"
                    label="Categoria"
                    width="flex-[1_0_280px]"
                    natureId={watch('natureId')}
                  />
                  <PaymentConditionsSelectField
                    name="paymentConditionId"
                    label="Condição de pagamento"
                    width="flex-[1_0_280px]"
                    additionalOnChange={(value) => {
                      fields.forEach((_, index) => {
                        setValue(
                          `installments.${index}.paymentConditionId`,
                          value,
                        )
                      })
                    }}
                  />
                  <FormInput
                    type="number"
                    name="installmentQty"
                    label="Quantidade de parcelas"
                    width="flex-[1_0_280px]"
                    min={1}
                    max={MAX_INSTALLMENTS_ALLOWED}
                    additionalOnChange={(value) =>
                      handleInstallmentsQuantity(Number(value))
                    }
                  />
                  <FormDatePickerSingle
                    name="referenceDate"
                    label="Competência"
                    width="flex-[1_0_280px]"
                  />
                  <FormDatePickerSingle
                    name="dueDate"
                    label="Data de vencimento"
                    width="flex-[1_0_280px]"
                    additionalOnChange={(value) => {
                      if (value) {
                        fields.forEach((_, index) => {
                          setValue(
                            `installments.${index}.dueDate`,
                            addMonths(new Date(value), index),
                          )
                        })
                      }
                    }}
                  />
                  {fields.length > 1 ? (
                    <InstallmentsForm
                      fields={fields}
                      balance={balance}
                      setBalance={setBalance}
                      handleRefreshBalance={handleRefreshBalance}
                    />
                  ) : null}
                  <FormTextarea name="notes" label="Observação" />
                </div>
              </DialogBody>
            </div>
            <DialogFooter className="sm:justify-between">
              <div className="flex items-center">
                {fields.length <= 1 && (
                  <FormSwitch
                    name="received"
                    label={`Marcar como ${type === 'receivable' ? 'recebido' : 'pago'}`}
                  />
                )}
              </div>
              <div className="space-x-4">
                {process.env.NODE_ENV === 'development' && (
                  <Button
                    type="button"
                    variant="neutralOutline"
                    onClick={() => {
                      form.trigger()
                      console.info(form.getValues())
                      console.info(form.formState.errors)
                    }}
                  >
                    Teste
                  </Button>
                )}
                <DialogTrigger asChild>
                  <Button type="button" variant="neutralOutline">
                    Cancelar
                  </Button>
                </DialogTrigger>
                <Button
                  type="submit"
                  RightIcon={IconCircleCheck}
                  isLoading={mutation.isPending}
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
