import { useEffect, useState, type ComponentProps } from 'react'

// UI
import { AlertBanner } from '@/components/ui/alert-banner'
import { useClientBlocked } from '../../useClientBlocked'
import { forgetConditions } from './fees'
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
  IconPencil,
  IconCircleCheck,
  IconAlertTriangle,
} from '@tabler/icons-react'

// Third-party
import { useQueryClient } from '@tanstack/react-query'

// Actions
import { getItem, updateItemNew } from '@/actions/_cruds'

// Hooks
import { useQuotationCredit } from '@/hooks/queries/useQuotationCredit'
import { AllowedConditionsContext } from './allowedConditions'

// Libs
import { actionDisabled } from '@/lib/quotation'
import { cn, formatCurrencyToBrl } from '@/lib/utils'

// Types
import type { QuotationType } from '@/types/sales/quotation'
import type { PaymentConditionsType } from '@/types/settings/paymentCondition'
import { CustomButton } from '@/components/common/CustomButton'
import { PermissionGate } from '@/components/common/PermissionGate'

interface Props {
  quotationData: QuotationType
  onFinish?: () => void
  actionTitle?: string
  actionIcon?: ComponentProps<typeof CustomButton>['icon']
  actionIconTone?: ComponentProps<typeof CustomButton>['iconTone']
  submitLabel?: string
  // Controlado de fora (06/10/2026): concluir e aprovar abrem o diálogo
  // depois de avisar o que falta, sem um botão próprio dele na tela
  open?: boolean
  onOpenChange?: (open: boolean) => void
  hideTrigger?: boolean
  // A entrada que faz a venda caber no limite de crédito (PA-2, 12/11/2026),
  // em centavos: o diálogo abre com ela lançada, vencendo hoje
  suggestedDownPayment?: number
}

export function PaymentConditionsDialog({
  quotationData,
  onFinish,
  actionTitle = 'Concluir orçamento',
  actionIcon = IconCircleCheck,
  actionIconTone = 'info',
  submitLabel,
  open: controlledOpen,
  onOpenChange,
  hideTrigger,
  suggestedDownPayment,
}: Props) {
  // EC-17: desconto acima do limite do vendedor não salva
  const [exceedsDiscountLimit, setExceedsDiscountLimit] = useState(false)

  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = (value: boolean) => {
    setInternalOpen(value)
    onOpenChange?.(value)
  }

  // const isFetching = useIsFetching()

  const queryClient = useQueryClient()

  // Só as formas liberadas para o cliente (correção do LITE, 11/11/2026)
  const { data: credit } = useQuotationCredit(
    quotationData?.id,
    open && !!quotationData?.client?.id,
    `${quotationData?.client?.id ?? ''}|${quotationData?.updatedAt ?? ''}`,
  )
  const allowedConditionIds = credit?.allowedConditionIds ?? null

  const form = useForm<QuotationPaymentConditionsType>({
    resolver: zodResolver(quotationPaymentConditionsSchema),
    mode: 'onChange', // Validar ao alterar os campos
  })

  const {
    watch,
    reset,
    setValue,
    setError,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = form

  // Resetar valores do formulário ao abrir o modal
  useEffect(() => {
    if (!open || !quotationData) return

    // As condições podem ter mudado no cadastro desde a última abertura
    forgetConditions()

    // Resetar o formulário com os valores padrão
    const initialValues = defaultValues(quotationData)
    reset(initialValues)

    // "Usar R$ X como entrada" (PA-2): a entrada da diferença, no ato. As
    // parcelas se refazem quando a entrada aparece (DownPayment)
    if (suggestedDownPayment && suggestedDownPayment > 0) {
      setValue('hasDownPayment', 'true')
      setValue('downPayment.dueDate', new Date())
      setValue('downPayment.amount', suggestedDownPayment)
    }

    // O mín/máx de parcelas salvo no orçamento pode estar desatualizado
    // (ex.: gravado como 1x), o que limitava o campo Parcelas a "1x" ao
    // reabrir. Busca a configuração atual da condição selecionada e
    // sincroniza mín/máx — sem tocar em installmentQty/installments para
    // não sobrescrever as parcelas já salvas.
    const conditionId = (initialValues as QuotationPaymentConditionsType)
      .paymentConditionId
    if (conditionId) {
      getItem({ route: `/payment-condition/${conditionId}` }).then((res) => {
        if (!res.success || !res.data) return
        const data = res.data as PaymentConditionsType
        setValue('minInstallmentQty', data.minInstallments || 1)
        setValue('maxInstallmentQty', data.maxInstallments || 1)
      })
    }

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
    delete data.dayInterval

    delete data.dayInterval

    return data
  }

  const onSubmit = async (data: QuotationPaymentConditionsType) => {
    const body = refineData(data)

    // refineData só devolve vazio quando falta a forma de pagamento da entrada.
    // Sem aviso, clicar em "Salvar e concluir" não fazia absolutamente nada.
    if (!body) {
      toast.error('Informe a forma de pagamento da entrada para continuar.')
      return
    }

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

    // Continua o fluxo que abriu o modal, como concluir ou aprovar.
    onFinish?.()
  }

  const onTest = async () => {
    form.trigger()

    const data = getValues()
    refineData(data)

    console.info('Refined data: ', data)
    console.info('Errors: ', form.formState.errors)
  }

  // const isBusy = isSubmitting || isFetching > 0
  const blocked = useClientBlocked(quotationData)
  const isBusy = isSubmitting
  const saveButtonLabel =
    submitLabel ?? (onFinish ? 'Salvar e concluir' : 'Salvar')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <TooltipProvider>
          <DialogTrigger asChild>
            {onFinish ? (
              <CustomButton
                icon={actionIcon}
                title={actionTitle}
                iconTone={actionIconTone}
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
      )}
      <DialogContent className="sm:max-w-[950px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <DialogTitle>Editar condições de pagamento</DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Configurar condições de pagamento do orçamento
          </DialogDescription>
        </DialogHeader>
        {suggestedDownPayment ? (
          <AlertBanner
            variant="info"
            icon={IconAlertTriangle}
            className="mx-6 mt-4 rounded-lg border"
            title={`Entrada sugerida: ${formatCurrencyToBrl(suggestedDownPayment)}, vencendo hoje`}
            description="Com esta entrada paga, o que fica a prazo cabe no limite de crédito do cliente. Escolha a forma de pagamento da entrada e salve. Ao aprovar, a venda fica pendente até a entrada ser recebida no financeiro."
          />
        ) : null}
        {blocked && (
          <AlertBanner
            variant="error"
            icon={IconAlertTriangle}
            className="mx-6 mt-4 rounded-lg border"
            title="Cliente bloqueado"
            description="As condições podem ser definidas, mas este orçamento não é aprovado nem gera cobrança enquanto o cliente estiver bloqueado no cadastro."
          />
        )}
        <DialogBody>
          <AllowedConditionsContext.Provider value={allowedConditionIds}>
            <Form {...form}>
              <form
                id="quotation-payment-conditions"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="flex flex-wrap gap-4"
              >
                <TypeAndBilling quotationData={quotationData} />

                <FormSelect
                  name="hasDownPayment"
                  label="Entrada"
                  options={[
                    { value: 'false', label: 'Não' },
                    { value: 'true', label: 'Sim' },
                  ]}
                  width="flex-[1_0_50px]"
                />

                <PaymentMethodAndCondition quotationData={quotationData} />

                <InstallmentQty />

                <Separator className="my-2 bg-gray-300" />

                {hasDownPayment === 'true' && (
                  <DownPayment suggestedAmount={suggestedDownPayment} />
                )}

                {installments?.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-300 w-full">
                    <div className="space-y-6 p-6 pb-0">
                      <Installments />
                    </div>
                  </div>
                )}

                <FormBrlInput
                  name="commission.totalCommission"
                  label="Valor da comissão"
                  startAdornment={<>R$</>}
                  width="flex-[1_0_200px]"
                  disabled
                  readOnly
                />

                <DiscountAndTotal
                  addComissionValue={addComissionValue}
                  quotationData={quotationData}
                  onDiscountLimitChange={setExceedsDiscountLimit}
                />

                <FormTextarea
                  name="description"
                  label="Descrição auxiliar"
                  width="w-full"
                />
              </form>
            </Form>
          </AllowedConditionsContext.Provider>
        </DialogBody>
        {/* No celular: os totais em cima, "Adicionar comissão" numa linha
            própria e os botões embaixo, dividindo a largura (20/11/2026) */}
        <DialogFooter className="sm:justify-between max-sm:flex-col">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <PermissionGate permissions={['values:values:view']}>
              <div>
                <p className="text-lg font-semibold text-gray-500 text-nowrap">
                  {formatCurrencyToBrl(
                    quotationData?.quotationItems?.reduce(
                      (acc, item) => acc + (item?.totalValue || 0),
                      0,
                    ),
                  )}
                </p>
                <p className="text-sm font-medium text-gray-400">Valor base</p>
              </div>

              <FinalValue
                form={form}
                quotationData={quotationData}
                addComissionValue={addComissionValue}
              />
            </PermissionGate>

            <div className="max-sm:w-full max-sm:[&>button]:w-full">
              <CommissionDialog
                paymentConditionsForm={form}
                disabled={isBusy}
              />
            </div>
          </div>
          <div className="flex gap-4 max-sm:w-full max-sm:gap-3 max-sm:[&>button]:flex-1">
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
              disabled={isBusy || exceedsDiscountLimit}
              isLoading={isSubmitting}
            >
              {saveButtonLabel}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
