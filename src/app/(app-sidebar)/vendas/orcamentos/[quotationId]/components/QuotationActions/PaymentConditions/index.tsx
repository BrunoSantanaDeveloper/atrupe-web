import { useEffect, useState } from 'react'

// UI
import { toast } from 'sonner'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Button, buttonVariants } from '@/components/ui/button'

// Components
import FinalValue from './FinalValue'
import { defaultValues } from './utils'
import { DownPayment } from './DownPayment'
import { Installments } from './Installments'
import { CommissionDialog } from './Commission'
import { TypeAndBilling } from './TypeAndBilling'
import { DiscountAndTotal } from './DiscountAndTotal'
import { PaymentMethodAndCondition } from './PaymentMethod'
import { ActionButton } from '@/components/common/ActionButton'
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormTextarea } from '@/components/common/form/FormTextarea'
import { FormBrlInput } from '@/components/common/form/FormBrlInput'

// Form
import {
  quotationPaymentConditionsSchema,
  type QuotationPaymentConditionsType,
} from './schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Icons
import { IconCoin, IconPencil, IconCircleCheck } from '@tabler/icons-react'

// Third-party
import {
  useMutation,
  useIsFetching,
  useQueryClient,
} from '@tanstack/react-query'

// Actions
import { updateItemNew } from '@/actions/_cruds'

// Libs
import { actionDisabled } from '@/lib/quotation'
import { cn, formatCurrencyToBrl } from '@/lib/utils'

// Types
import type { QuotationType } from '@/types/sales/quotation'
import { InstallmentQty } from './InstallmentQty'

interface Props {
  quotationData: QuotationType
}

export function PaymentConditionsDialog({ quotationData }: Props) {
  const [open, setOpen] = useState(false)

  const isFetching = useIsFetching()

  const queryClient = useQueryClient()

  const form = useForm<QuotationPaymentConditionsType>({
    resolver: zodResolver(quotationPaymentConditionsSchema),
    mode: 'onChange', // Validar ao alterar os campos
  })

  const { watch, reset, setError, getValues, handleSubmit, setValue } = form

  // Resetar valores do formulário ao abrir o modal
  useEffect(() => {
    if (!open || !quotationData) return

    // Resetar o formulário com os valores padrão
    const initialValues = defaultValues(quotationData)
    reset(initialValues)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, quotationData])

  // ##################################################################################

  const commission = watch('commission')
  const installments = watch('installments')
  const hasDownPayment = watch('hasDownPayment')
  const baseValue = watch('paymentConditionsBaseValue') || 0

  // Recalcular a comissão percentual quando o valor base mudar (sem considerar desconto)
  useEffect(() => {
    if (!commission || commission.commissionType !== 'PERCENT') return

    // Calcular o novo valor da comissão
    const commissionPercentage = commission.commissionValue / 100
    const newCommissionTotal = baseValue * commissionPercentage

    // Atualizar o valor total da comissão
    setValue('commission.totalCommission', newCommissionTotal)

    // Recalcular o valor total
    const currentTotalValue = getValues('totalValue')
    const newTotalValue =
      currentTotalValue -
      (commission.type === 'ADD' ? commission.totalCommission || 0 : 0) +
      (commission.type === 'ADD' ? newCommissionTotal : 0)
    setValue('totalValue', newTotalValue)

    // Recalcular as parcelas
    if (installments?.length > 0) {
      const installmentQty = getValues('installmentQty')
      const qtyNumber = Number(installmentQty)
      const downPaymentAmount = getValues('downPayment.amount') || 0
      const valueToDistribute =
        newTotalValue - (hasDownPayment === 'true' ? downPaymentAmount : 0)
      const installmentValue = valueToDistribute / qtyNumber

      const updatedInstallments = installments.map((installment) => ({
        ...installment,
        amount: installmentValue,
      }))

      setValue('installments', updatedInstallments)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseValue])

  // Valor da comissão a ser somado no valor total
  // Para comissão do tipo ADD, somamos ao valor total
  // Para comissão do tipo SUB, não alteramos o valor total (a comissão é subtraída do lucro)
  const addComissionValue =
    commission?.type === 'ADD' ? commission?.totalCommission || 0 : 0

  // ##################################################################################

  // Faz a requisição para atualizar condições de pagamento
  const mutation = useMutation({
    mutationFn: (body: QuotationPaymentConditionsType) =>
      updateItemNew({
        route: `/quotation/payment/${quotationData.id}`,
        data: body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })

  // Refinar dados para o body da requisição
  const refineData = (data: QuotationPaymentConditionsType) => {
    data.hasDownPayment = JSON.parse(data.hasDownPayment)

    // Se há entrada, o campo condição de pagamento da entrada é obrigatório
    if (data.hasDownPayment && !data.downPayment?.paymentConditionId) {
      setError('downPayment.paymentConditionId', {
        message: 'Campo obrigatório',
      })
      return
    }

    // Se não há entrada, remover entrada
    if (!data.hasDownPayment) {
      data.downPayment = null
    }

    // Garantir que o campo commission seja sempre um objeto
    if (!data.commission || data.commission === null) {
      data.commission = { totalCommission: null }
    }

    data.installmentQty = Number(data.installmentQty) as unknown as string
    delete data.paymentConditionsBaseValue

    return data
  }

  const onSubmit = async (data: QuotationPaymentConditionsType) => {
    const body = refineData(data)

    if (!body) return

    try {
      await mutation.mutateAsync(body)
      toast.success('Informações de condições de pagamento salvas!')
      setOpen(false)
    } catch (error) {
      toast.error('Erro ao salvar informações de condições de pagamento!')
    }
  }

  const onTest = async () => {
    form.trigger()

    const data = getValues()
    refineData(data)

    console.info('Refined data: ', data)
    console.info('Errors: ', form.formState.errors)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionButton
          Icon={IconPencil}
          tooltip="Editar condições de pagamento"
          className={cn(
            buttonVariants({ variant: 'neutralLight', size: 'icon' }),
          )}
          disabled={actionDisabled('paymentConditions', quotationData?.status)}
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[950px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconCoin} />
            <DialogTitle>Editar condições de pagamento</DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Configurar condições de pagamento do orçamento
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="quotation-payment-conditions"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-wrap gap-4"
            >
              <TypeAndBilling />

              <PaymentMethodAndCondition quotationData={quotationData} />

              <Separator className="my-2 bg-gray-300" />

              <InstallmentQty />

              <FormSelect
                name="hasDownPayment"
                label="Entrada"
                options={[
                  { value: 'false', label: 'Não' },
                  { value: 'true', label: 'Sim' },
                ]}
                width="flex-[1_0_85px]"
              />

              <FormBrlInput
                name="commission.totalCommission"
                label="Valor Comissão"
                startAdornment={<>R$</>}
                width="flex-[1_0_200px]"
                disabled
                readOnly
              />

              <DiscountAndTotal addComissionValue={addComissionValue} />

              <Separator className="my-2 bg-gray-300" />

              {hasDownPayment === 'true' && <DownPayment />}

              {installments?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-300 w-full">
                  <div className="space-y-6 p-6 pb-0">
                    <Installments />
                  </div>
                </div>
              )}

              <FormTextarea
                name="description"
                label="Descrição auxiliar"
                width="w-full"
              />
            </form>
          </Form>
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <div className="flex gap-6">
            <div>
              <p className="text-lg font-semibold text-gray-500 text-nowrap">
                {formatCurrencyToBrl(
                  quotationData?.totalValue +
                    quotationData?.deliveryInfo?.value,
                )}
              </p>
              <p className="text-sm font-medium text-gray-400">Valor base</p>
            </div>

            <FinalValue
              form={form}
              quotationData={quotationData}
              addComissionValue={addComissionValue}
            />

            <CommissionDialog
              paymentConditionsForm={form}
              quotationData={quotationData}
            />
          </div>
          <div className="space-x-4">
            {process.env.NODE_ENV === 'development' && (
              <Button type="button" variant="neutral" onClick={onTest}>
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
              form="quotation-payment-conditions"
              RightIcon={IconCircleCheck}
              disabled={isFetching > 0 || mutation.isPending}
              isLoading={form.formState.isSubmitting}
            >
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
