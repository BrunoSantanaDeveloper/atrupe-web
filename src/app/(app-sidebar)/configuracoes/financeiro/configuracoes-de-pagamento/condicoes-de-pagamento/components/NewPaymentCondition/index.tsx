'use client'

// React
import { useState, useEffect } from 'react'

// UI
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

// Components
import { toast } from 'sonner'
import { FormInput } from '@/components/common/form/FormInput'
import { FormRadio } from '@/components/common/form/FormRadio'
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormSwitch } from '@/components/common/form/FormSwitch'
import { FormBrlInput } from '@/components/common/form/FormBrlInput'
import { PaymentConditionsType } from '@/types/settings/paymentCondition'
import { SelectPaymentMethodField } from '@/components/common/form/global-inputs/PaymentMethodsSelectField'

// Form
import { useForm } from 'react-hook-form'
import { FormType, MAX_INSTALLMENTS_ALLOWED, schema } from './schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { createItemNew, updateItemNew } from '@/actions/_cruds'
import { useQueryClient } from '@tanstack/react-query'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { usePlanErrorToast } from '@/hooks/usePlanErrorToast'

// Icons
import { IconCircleCheck, IconPlus } from '@tabler/icons-react'

interface Props {
  editMode?: boolean
  open?: boolean
  setOpen?: (value: string) => void
  rowData?: PaymentConditionsType
}

export function NewPaymentCondition({
  editMode,
  open,
  setOpen,
  rowData,
}: Props) {
  const [showDialog, setShowDialog] = useState(false)
  const [maxInstallmentsLength, setMaxInstallmentsLength] = useState(0)

  const queryClient = useQueryClient()
  const { canManageBankTaxTransfer, hasFeature } = usePlanFeatures()
  const { notifyActionError } = usePlanErrorToast()

  const canManageTaxInput = canManageBankTaxTransfer()
  const hasFiscalModule = hasFeature('nota_fiscal')

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    values: {
      name: rowData?.name || '',
      paymentMethodId: rowData?.paymentMethod.id || '',
      acceptInstallments: rowData?.acceptInstallments || false,
      costType: rowData?.costType || 'PERCENT',
      minInstallments: rowData?.minInstallments || 1,
      maxInstallments: rowData?.maxInstallments || 1,
      installments: rowData?.installments?.map((installment) => ({
        ...installment,
        operatorFeeRate: installment.operatorFeeRate,
        operatorFeeTransfer: installment.operatorFeeTransfer,
      })) || [
        {
          operatorFeeRate: 0,
          operatorFeeTransfer: 0,
        },
      ],
      receivingType: rowData?.receivingType || 'CASH',
      dayInterval: rowData?.dayInterval || 0,
      generateInvoice: rowData?.generateInvoice || false,
      invoiceType: rowData?.invoiceType || undefined,
    },
  })

  const { watch, setValue, formState } = form

  const acceptInstallments = watch('acceptInstallments')
  const maxInstallments = watch('maxInstallments') || 0
  const receivingType = watch('receivingType')
  const generateInvoice = watch('generateInvoice')

  const costType = watch('costType')
  const installments = watch('installments')

  // Conversão entre tipos de custo (percentual <-> valor fixo)
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'costType' && value.costType) {
        const currentInstallments = form.getValues('installments') || []
        const newCostType = value.costType

        // Converte os valores das parcelas
        const convertedInstallments = currentInstallments.map((installment) => {
          // De PERCENT para VALUE: multiplica por 100 (1.5% -> R$ 1,50 = 150 centavos)
          // De VALUE para PERCENT: divide por 100 (150 centavos -> 1.5%)
          const operatorFeeRate =
            newCostType === 'VALUE'
              ? (installment.operatorFeeRate || 0) * 100
              : (installment.operatorFeeRate || 0) / 100

          const operatorFeeTransfer =
            newCostType === 'VALUE'
              ? (installment.operatorFeeTransfer || 0) * 100
              : (installment.operatorFeeTransfer || 0) / 100

          return {
            ...installment,
            operatorFeeRate,
            operatorFeeTransfer,
          }
        })

        setValue('installments', convertedInstallments)
      }
    })

    return () => subscription.unsubscribe()
  }, [form, setValue])

  useEffect(() => {
    if (maxInstallments > 0 && maxInstallments <= MAX_INSTALLMENTS_ALLOWED) {
      const currentInstallments = form.getValues('installments') || []

      const installments = Array.from(
        { length: maxInstallments },
        (_, index) => ({
          ...currentInstallments[index],
          operatorFeeRate: currentInstallments[index]?.operatorFeeRate ?? 0,
          operatorFeeTransfer:
            currentInstallments[index]?.operatorFeeTransfer ?? 0,
        }),
      )

      setValue('installments', installments)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxInstallments])

  useEffect(() => {
    if (acceptInstallments && receivingType === 'CASH') {
      setValue('receivingType', 'INSTALLMENTS')
    }
    if (!acceptInstallments) {
      setValue('receivingType', 'CASH')
      setValue('installments', [
        {
          operatorFeeRate: installments?.[0]?.operatorFeeRate ?? 0,
          operatorFeeTransfer: installments?.[0]?.operatorFeeTransfer ?? 0,
        },
      ])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acceptInstallments, receivingType, setValue])

  // Debounce para renderizar parcelas
  useEffect(() => {
    const handler = setTimeout(() => {
      setMaxInstallmentsLength(maxInstallments)
    }, 500)

    return () => clearTimeout(handler)
  }, [maxInstallments])

  const onSubmit = async (form: FormType) => {
    // Em R$ por parcela, a condição guarda o mesmo valor em todas as linhas:
    // quem lê a linha N (orçamento, caixa) continua achando a taxa
    const data =
      form.costType === 'VALUE'
        ? {
            ...form,
            installments: Array.from(
              {
                length: form.acceptInstallments ? form.maxInstallments || 1 : 1,
              },
              () => ({
                operatorFeeRate: form.installments?.[0]?.operatorFeeRate ?? 0,
                operatorFeeTransfer:
                  form.installments?.[0]?.operatorFeeTransfer ?? 0,
              }),
            ),
          }
        : form
    const result = editMode
      ? await updateItemNew({
          route: `/payment-condition/${rowData?.id}`,
          data,
        })
      : await createItemNew({
          route: '/payment-condition',
          data,
        })

    if (result.success) {
      queryClient.invalidateQueries()
      toast.success(
        `Condição de pagamento ${editMode ? 'atualizada' : 'criada'} com sucesso`,
      )
      handleOpenChange(false)
    } else {
      // A taxa da operadora é recurso de plano: o servidor recusa sem ele.
      notifyActionError(result)
    }
  }

  const handleOpenChange = (value: boolean) => {
    form.reset()
    setOpen?.(value ? 'edit' : '')
    setShowDialog(value)
  }

  const showNameInput = false // TODO: Campo de nome deve aparecer se tiver mais de uma condição de pagamento para a forma selecionada

  return (
    <Dialog open={editMode ? open : showDialog} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {!editMode && (
          <Button LeftIcon={IconPlus}>Nova condição de pagamento</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[672px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <span>
                {editMode
                  ? 'Editar condição de pagamento'
                  : 'Nova condição de pagamento'}
              </span>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Condição de pagamento
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              id="new-payment-condition"
              className="flex flex-wrap gap-5"
              noValidate
            >
              {/* A lista de formas é a mesma para todas as empresas e só
                  o superadmin cria; a condição já usada não troca de
                  forma, só de parcelas (PO, 14/10/2026) */}
              <SelectPaymentMethodField
                name="paymentMethodId"
                width="w-full"
                additionalOnChange={(_, label) => {
                  setValue('name', label)
                }}
              />

              {showNameInput && (
                <FormInput name="name" label="Nome" width="w-full" />
              )}

              <p className="w-full font-semibold">Parcelamento</p>

              <FormSwitch
                name="acceptInstallments"
                label="Aceita parcelamento"
                className="w-full"
                additionalOnChange={(value) => {
                  if (value) return
                  setValue('minInstallments', 1)
                  setValue('maxInstallments', 1)
                }}
              />

              {canManageTaxInput && (
                <FormSelect
                  name="costType"
                  label="Como a taxa é cobrada"
                  width="w-full"
                  options={[
                    {
                      value: 'PERCENT',
                      label: '% sobre a venda (cartão, link de pagamento)',
                    },
                    { value: 'VALUE', label: 'R$ por parcela (boleto)' },
                  ]}
                />
              )}

              {acceptInstallments ? (
                <>
                  <FormInput
                    name="minInstallments"
                    label="Parcela mínima"
                    type="number"
                    min={1}
                    max={maxInstallments || MAX_INSTALLMENTS_ALLOWED}
                    width="flex-[1_0_100px]"
                  />

                  <FormInput
                    name="maxInstallments"
                    label="Parcela máxima"
                    type="number"
                    min={1}
                    max={MAX_INSTALLMENTS_ALLOWED}
                    width="flex-[1_0_100px]"
                    additionalOnChange={(e) => {
                      const value = e as number
                      if (value > MAX_INSTALLMENTS_ALLOWED) {
                        setValue('maxInstallments', MAX_INSTALLMENTS_ALLOWED)
                      } else {
                        setValue('maxInstallments', value)
                      }
                    }}
                  />

                  {canManageTaxInput && costType === 'PERCENT' ? (
                    <>
                      <p className="w-full text-sm text-gray">
                        A operadora cobra pela quantidade de parcelas da venda:
                        a linha 3x vale para a venda parcelada em 3 vezes, sobre
                        o total pago nesta forma.
                      </p>
                      {Array.from({ length: maxInstallmentsLength }).map(
                        (_, index) => (
                          <div key={index} className="w-full">
                            <div className="flex flex-wrap gap-4">
                              <p className="text-sm font-medium flex-[1_0_100px] mt-6">
                                {index + 1}x
                              </p>
                              <FormInput
                                key={'operatorFeeRate' + (index + 1)}
                                type="number"
                                name={`installments.${index}.operatorFeeRate`}
                                label="Taxa da operadora (custo)"
                                width="flex-[1_0_100px]"
                                endAdornment={<>%</>}
                              />
                              <FormInput
                                key={'operatorFeeTransfer' + (index + 1)}
                                type="number"
                                name={`installments.${index}.operatorFeeTransfer`}
                                label="Repasse ao cliente"
                                width="flex-[1_0_100px]"
                                endAdornment={<>%</>}
                              />
                            </div>
                          </div>
                        ),
                      )}
                    </>
                  ) : null}
                </>
              ) : null}

              {/* Em R$, um valor por parcela, com ou sem parcelamento; em %
                  à vista, uma taxa só */}
              {canManageTaxInput &&
                (costType === 'VALUE' || !acceptInstallments) && (
                  <div className="w-full">
                    <p className="text-sm text-gray">
                      {costType === 'VALUE'
                        ? 'Cobrada em cada parcela (cada boleto): em 3 parcelas, 3 vezes o valor.'
                        : 'Sobre o total pago nesta forma.'}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <p className="text-sm font-medium flex-[1_0_100px] mt-6">
                        {costType === 'VALUE' ? 'Por parcela' : 'À vista'}
                      </p>
                      {costType === 'VALUE' ? (
                        <>
                          <FormBrlInput
                            key="operatorFeeRate1"
                            name={`installments.0.operatorFeeRate`}
                            label="Taxa da operadora (custo)"
                            width="flex-[1_0_100px]"
                            startAdornment={<>R$</>}
                          />
                          <FormBrlInput
                            key="operatorFeeTransfer1"
                            name={`installments.0.operatorFeeTransfer`}
                            label="Repasse ao cliente"
                            width="flex-[1_0_100px]"
                            startAdornment={<>R$</>}
                          />
                        </>
                      ) : (
                        <>
                          <FormInput
                            key="operatorFeeRate1"
                            type="number"
                            name={`installments.0.operatorFeeRate`}
                            label="Taxa da operadora (custo)"
                            width="flex-[1_0_100px]"
                            endAdornment={<>%</>}
                          />
                          <FormInput
                            key="operatorFeeTransfer1"
                            type="number"
                            name={`installments.0.operatorFeeTransfer`}
                            label="Repasse ao cliente"
                            width="flex-[1_0_100px]"
                            endAdornment={<>%</>}
                          />
                        </>
                      )}
                    </div>
                  </div>
                )}

              {canManageTaxInput && (
                <p className="w-full text-sm text-gray">
                  A taxa da operadora é o seu custo: fica guardada para o
                  cálculo de custos (PRO). O repasse é o que o cliente paga a
                  mais, somado ao orçamento como acréscimo.
                </p>
              )}

              {hasFiscalModule && (
                <>
                  <p className="w-full font-semibold">Nota Fiscal</p>

                  <FormSwitch
                    name="generateInvoice"
                    label="Gerar NF automaticamente ao aprovar"
                    className="w-full"
                  />

                  {generateInvoice && (
                    <FormSelect
                      name="invoiceType"
                      label="Tipo de nota"
                      options={[
                        { value: 'NFE', label: 'NF-e (Produto)' },
                        { value: 'NFSE', label: 'NFS-e (Serviço)' },
                        { value: 'NFCE', label: 'NFC-e (Consumidor)' },
                      ]}
                      width="w-full"
                    />
                  )}
                </>
              )}

              <p className="w-full font-semibold">Recebimento</p>

              <FormRadio
                name="receivingType"
                className="w-full"
                items={[
                  {
                    value: 'INSTALLMENTS',
                    label: 'Recebo parcelado',
                    disabled: !acceptInstallments,
                  },
                  {
                    value: 'ANTICIPATE',
                    label: 'Antecipo as parcelas',
                    disabled: !acceptInstallments,
                  },
                  {
                    value: 'CASH',
                    label: 'À vista',
                    disabled: acceptInstallments,
                  },
                ]}
              />

              <FormInput
                name="dayInterval"
                // À vista também pode ter prazo (o cartão de débito cai no
                // dia seguinte): zero é à vista (27/10/2026)
                label={
                  receivingType === 'INSTALLMENTS'
                    ? 'Intervalo (dias)'
                    : receivingType === 'ANTICIPATE'
                      ? 'Recebo em (dias)'
                      : 'Recebo em (dias) · 0 = à vista'
                }
                type="number"
                width="flex-[1_0_100px]"
              />
            </form>
          </Form>
        </DialogBody>
        <DialogFooter>
          {process.env.NODE_ENV === 'development' && (
            <Button
              type="button"
              variant="neutralOutline"
              onClick={() => {
                form.trigger()
                console.info('form', form.getValues())
                console.info('errors', form.formState.errors)
              }}
            >
              Teste
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={formState.isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="new-payment-condition"
            RightIcon={IconCircleCheck}
            isLoading={formState.isSubmitting}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
