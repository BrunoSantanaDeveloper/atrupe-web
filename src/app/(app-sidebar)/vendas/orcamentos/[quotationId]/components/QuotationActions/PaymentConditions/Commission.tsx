// React
import { useEffect, useState } from 'react'

// UI
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
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormBrlInput } from '@/components/common/form/FormBrlInput'
import FormToggleCard from '@/components/common/form/FormToggleCard'
import { PickValuePercentSelect } from '@/components/common/PickValuePercentSelect'
import { SupplierSelectField } from '@/components/common/form/global-inputs/SupplierSelectField'

// Form
import {
  quotationCommissionSchema,
  QuotationPaymentConditionsType,
  type QuotationCommissionType,
} from './schema'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Icons
import {
  IconCircleCheck,
  IconCurrencyDollar,
  IconMinus,
  IconPlus,
} from '@tabler/icons-react'

// Types
import { QuotationType } from '@/types/sales/quotation'

import { formatCurrencyToBrl } from '@/lib/utils'
import { defaultCommissionValues } from './utils'
import { FormInput } from '@/components/common/form/FormInput'

const transferOptions = [
  { value: 'SINGLE', label: 'Parcela única' },
  {
    value: 'PAYMENT_BASED',
    label: 'Conforme forma de pagamento',
  },
]

const toggleOptions = [
  {
    label: 'Adição',
    description:
      'O valor ou porcentagem da comissão é adicionado ao valor final da venda.',
    value: 'ADD',
    icon: IconPlus,
  },
  {
    label: 'Subtração',
    description:
      'O valor ou porcentagem da comissão é repassado a partir do lucro da venda.',
    value: 'SUB',
    icon: IconMinus,
  },
]

interface Props {
  quotationData: QuotationType
  paymentConditionsForm: UseFormReturn<QuotationPaymentConditionsType>
}

export function CommissionDialog({
  quotationData,
  paymentConditionsForm,
}: Props) {
  const [open, setOpen] = useState(false)

  const form = useForm<QuotationCommissionType>({
    resolver: zodResolver(quotationCommissionSchema),
  })

  const { reset, setValue, handleSubmit, watch, setError, clearErrors } = form

  const paymentConditionsBaseValue =
    paymentConditionsForm.getValues('paymentConditionsBaseValue') || 0

  // Valor base da comissão = (Valor base das condições de pagamento) - (desconto das condições de pagamento)
  const commissionBaseValue =
    paymentConditionsBaseValue -
    (paymentConditionsForm?.getValues()?.discount?.discountTotal || 0)

  useEffect(() => {
    if (!open) return

    const currentCommission = paymentConditionsForm?.getValues()?.commission

    reset(defaultCommissionValues(currentCommission, commissionBaseValue))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Garantir que o tipo de comissão seja selecionado corretamente
  useEffect(() => {
    if (!open) return

    // Definir o tipo de comissão com base no valor atual
    const currentType = paymentConditionsForm?.getValues()?.commission?.type
    if (currentType) {
      setValue('type', currentType)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const commissionType = watch('commissionType')

  const handleCommissionValueChange = (value: string | number | null) => {
    const inputCommission = Number(value)

    let totalCommission = 0

    if (commissionType === 'VALUE') {
      totalCommission = inputCommission
    } else if (commissionType === 'PERCENT') {
      const commissionPercentage = inputCommission / 100
      totalCommission = commissionBaseValue * commissionPercentage
    }

    setValue('totalCommission', totalCommission)
  }

  const onSubmit = async (data: QuotationCommissionType) => {
    // Se o valor da comissão for zero, limpar o objeto de comissão
    if (!data.commissionValue || data.commissionValue === 0) {
      // Obter o valor total atual e a comissão atual
      const totalValue = paymentConditionsForm.getValues('totalValue')
      const currentCommission = paymentConditionsForm.getValues('commission')

      // Se havia uma comissão do tipo ADD, ajustar o valor total
      let newTotalValue = totalValue
      if (currentCommission?.type === 'ADD') {
        newTotalValue -= currentCommission.totalCommission || 0
        paymentConditionsForm.setValue('totalValue', newTotalValue)
      }

      // Limpar o objeto de comissão
      paymentConditionsForm.setValue('commission.totalCommission', 0)
      paymentConditionsForm.setValue('commission', null)

      // Recalcular as parcelas
      updateInstallments(newTotalValue)

      setOpen(false)
      return
    }

    // Validações
    if (!data.type) {
      setError('type', {
        message: 'Tipo de comissão obrigatório',
      })
      return
    }

    if (!data.supplierId) {
      setError('supplierId', {
        message: 'Fornecedor obrigatório',
      })
      return
    }

    // Criar objeto de comissão
    const commission = {
      type: data.type,
      supplierId: data.supplierId,
      transferMethod: data.transferMethod,
      commissionType: data.commissionType,
      commissionValue: data.commissionValue || 0,
      totalCommission: data.totalCommission || 0,
    }

    // Obter o valor total atual e a comissão atual
    const totalValue = paymentConditionsForm.getValues('totalValue')
    const currentCommission = paymentConditionsForm.getValues('commission')

    // Calcular o novo valor total
    let newTotalValue = totalValue

    // 1. Remover a comissão atual do valor total (se existir e for do tipo ADD)
    if (currentCommission?.type === 'ADD') {
      newTotalValue -= currentCommission.totalCommission || 0
    }

    // 2. Adicionar a nova comissão ao valor total apenas se for do tipo ADD
    if (commission.type === 'ADD') {
      newTotalValue += commission.totalCommission
    }

    // Atualizar o objeto de comissão no formulário principal
    paymentConditionsForm.setValue('commission', commission)

    // Atualizar o valor total
    paymentConditionsForm.setValue('totalValue', newTotalValue)

    // Recalcular as parcelas com o novo valor total
    updateInstallments(newTotalValue)

    setOpen(false)
  }

  // Função para recalcular as parcelas
  const updateInstallments = (newTotalValue: number) => {
    const installmentQty = paymentConditionsForm.getValues('installmentQty')
    const hasDownPayment = paymentConditionsForm.getValues('hasDownPayment')
    const downPaymentAmount =
      paymentConditionsForm.getValues('downPayment.amount') || 0
    const installments = paymentConditionsForm.getValues('installments') || []

    if (installments.length > 0 && installmentQty) {
      const qtyNumber = Number(installmentQty)
      const valueToDistribute =
        newTotalValue - (hasDownPayment === 'true' ? downPaymentAmount : 0)
      const installmentValue = valueToDistribute / qtyNumber

      const updatedInstallments = installments.map((installment) => ({
        ...installment,
        amount: installmentValue,
      }))

      paymentConditionsForm.setValue('installments', updatedInstallments)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" LeftIcon={IconCurrencyDollar}>
          Adicionar comissão
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[695px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconCurrencyDollar} />
            <DialogTitle>Comissão</DialogTitle>
          </div>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="quotation-commissions"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-wrap gap-4"
            >
              <FormToggleCard
                options={toggleOptions}
                onChange={(value) => {
                  setValue('type', value as 'ADD' | 'SUB')

                  // Recalcular o valor total da comissão quando o tipo é alterado
                  const commissionValue = watch('commissionValue') || 0
                  const commissionType = watch('commissionType')

                  if (commissionValue > 0) {
                    let totalCommission = 0

                    if (commissionType === 'VALUE') {
                      totalCommission = commissionValue
                    } else if (commissionType === 'PERCENT') {
                      const commissionPercentage = commissionValue / 100
                      totalCommission =
                        commissionBaseValue * commissionPercentage
                    }

                    setValue('totalCommission', totalCommission)
                  }
                }}
              />

              <SupplierSelectField
                name="supplierId"
                label="Fornecedor"
                width="w-full"
                onChange={(e) => {
                  setValue('supplierId', e)
                  clearErrors('supplierId')
                }}
                defaultValues={{
                  id:
                    quotationData?.paymentConditions?.commission?.supplier
                      ?.id || '',
                  name:
                    quotationData?.paymentConditions?.commission?.supplier
                      ?.name || '',
                }}
              />
              <FormBrlInput
                name="baseValue"
                label="Valor base"
                startAdornment={<>R$</>}
                width="flex-[1_0_200px]"
                disabled
              />
              <FormSelect
                name="transferMethod"
                label="Forma de repasse"
                options={transferOptions}
                width="flex-[1_0_200px]"
              />
              {commissionType === 'VALUE' ? (
                <FormBrlInput
                  name="commissionValue"
                  label="Comissão"
                  width="flex-[1_0_200px]"
                  className="[&>input]:-ml-1"
                  additionalOnChange={handleCommissionValueChange}
                  autoFocus
                  startAdornment={
                    <PickValuePercentSelect
                      name="commissionType"
                      onChange={(value) => {
                        setValue('commissionValue', 0)
                        setValue('totalCommission', 0)

                        // Se mudar para percentual, definir um valor padrão de 1%
                        if (value === 'PERCENT') {
                          setValue('commissionValue', 1)
                          // Calcular o valor total da comissão
                          const commissionPercentage = 0.01
                          const totalCommission =
                            commissionBaseValue * commissionPercentage
                          setValue('totalCommission', totalCommission)
                        }
                      }}
                    />
                  }
                />
              ) : (
                <FormInput
                  type="number"
                  name="commissionValue"
                  label="Comissão"
                  width="flex-[1_0_200px]"
                  additionalOnChange={handleCommissionValueChange}
                  autoFocus
                  startAdornment={
                    <PickValuePercentSelect
                      name="commissionType"
                      onChange={(value) => {
                        setValue('commissionValue', 0)
                        setValue('totalCommission', 0)

                        // Se mudar para percentual, definir um valor padrão de 1%
                        if (value === 'PERCENT') {
                          setValue('commissionValue', 1)
                          // Calcular o valor total da comissão
                          const commissionPercentage = 0.01
                          const totalCommission =
                            commissionBaseValue * commissionPercentage
                          setValue('totalCommission', totalCommission)
                        }
                      }}
                    />
                  }
                />
              )}
            </form>
          </Form>
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <div>
            <p className="text-lg font-semibold">
              {formatCurrencyToBrl(watch('totalCommission'))}
            </p>
            <p className="text-sm font-medium text-gray-700">Total Comissão</p>
          </div>
          <div className="space-x-4">
            <DialogTrigger asChild>
              <Button type="button" variant="neutralOutline">
                Cancelar
              </Button>
            </DialogTrigger>
            <Button
              type="submit"
              form="quotation-commissions"
              RightIcon={IconCircleCheck}
            >
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
