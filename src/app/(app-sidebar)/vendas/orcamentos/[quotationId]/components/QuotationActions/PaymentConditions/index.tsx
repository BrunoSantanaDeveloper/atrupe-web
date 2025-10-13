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
import { TooltipProvider } from '@/components/ui/tooltip'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Button, buttonVariants } from '@/components/ui/button'

// Components
import FinalValue from './FinalValue'
import { defaultValues } from './utils'
import { DownPayment } from './DownPayment'
import { Installments } from './Installments'
import { CommissionDialog } from './Commission'
import { TypeAndBilling } from './TypeAndBilling'
import { InstallmentQty } from './InstallmentQty'
import { DiscountAndTotal } from './DiscountAndTotal'
import { QUOTATION_DATA_QUERY_KEY } from '../../Quotation'
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
import {
  IconCoin,
  IconPencil,
  IconCircleCheck,
  IconProgressCheck,
} from '@tabler/icons-react'

// Third-party
import { useIsFetching, useQueryClient } from '@tanstack/react-query'

// Actions
import { updateItemNew } from '@/actions/_cruds'

// Libs
import { actionDisabled } from '@/lib/quotation'
import { cn, formatCurrencyToBrl } from '@/lib/utils'

// Types
import type { QuotationType } from '@/types/sales/quotation'
import { CustomButton } from '@/components/common/CustomButton'

interface Props {
  quotationData: QuotationType
  onFinish?: () => void
}

export function PaymentConditionsDialog({ quotationData, onFinish }: Props) {
  const [open, setOpen] = useState(false)

  const isFetching = useIsFetching()

  const queryClient = useQueryClient()

  const form = useForm<QuotationPaymentConditionsType>({
    resolver: zodResolver(quotationPaymentConditionsSchema),
    mode: 'onChange', // Validar ao alterar os campos
  })

  const {
    watch,
    reset,
    setError,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = form

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

  // Valor da comissão a ser somado no valor total
  // Para comissão do tipo ADD, somamos ao valor total
  // Para comissão do tipo SUB, não alteramos o valor total (a comissão é subtraída do lucro)
  const addComissionValue =
    commission?.type === 'ADD' ? commission?.totalCommission || 0 : 0

  // ##################################################################################

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

    const res = await updateItemNew({
      route: `sale/quotation/payment/${quotationData.id}`,
      data: body,
    })

    if (!res.success) {
      toast.error(res.message)
      return
    }

    queryClient.invalidateQueries({ queryKey: [QUOTATION_DATA_QUERY_KEY] })

    setOpen(false)

    // Se está salvando infos de pgto após tentar "Concluir Orçamento"
    onFinish?.()
  }

  const onTest = async () => {
    form.trigger()

    const data = getValues()
    refineData(data)

    console.info('Refined data: ', data)
    console.info('Errors: ', form.formState.errors)
  }

  const isBusy = isSubmitting || isFetching > 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <DialogTrigger asChild>
          {onFinish ? (
            <CustomButton
              icon={IconProgressCheck}
              title="Concluir orçamento"
              iconVariant="lightBlueBorderedLight"
            />
          ) : (
            <ActionButton
              Icon={IconPencil}
              tooltip="Editar condições de pagamento"
              className={cn(
                buttonVariants({ variant: 'neutralLight', size: 'icon' }),
              )}
              disabled={actionDisabled(
                'paymentConditions',
                quotationData?.status,
              )}
            />
          )}
        </DialogTrigger>
      </TooltipProvider>
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
              <TypeAndBilling quotationData={quotationData} />

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

            <CommissionDialog paymentConditionsForm={form} disabled={isBusy} />
          </div>
          <div className="space-x-4">
            {process.env.NODE_ENV === 'development' && (
              <Button type="button" variant="neutral" onClick={onTest}>
                Teste
              </Button>
            )}
            <DialogTrigger asChild>
              <Button type="button" variant="neutralOutline" disabled={isBusy}>
                Cancelar
              </Button>
            </DialogTrigger>
            <Button
              type="submit"
              form="quotation-payment-conditions"
              RightIcon={IconCircleCheck}
              disabled={isBusy}
              isLoading={isSubmitting}
            >
              Salvar {!!onFinish && 'e concluir'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
