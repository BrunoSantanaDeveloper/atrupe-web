import { Fragment } from 'react'
import { useFormContext } from 'react-hook-form'

import { Separator } from '@/components/ui/separator'
import { FormBrlInput } from '@/components/common/form/FormBrlInput'
import { FormDatePickerInput } from '@/components/common/form/FormDatePickerInput'
import { PaymentConditionsSelectField } from '@/components/common/form/global-inputs/PaymentConditionsSelectField'

import { QuotationPaymentConditionsType } from './schema'
import { PermissionGate } from '@/components/common/PermissionGate'
import { toast } from 'sonner'

import { loadCondition, withFees } from './fees'

export function Installments() {
  const form = useFormContext<QuotationPaymentConditionsType>()

  const { watch, setValue } = form

  const installments = watch('installments') || []
  const totalValue = watch('totalValue') || 0
  const hasDownPayment = watch('hasDownPayment')
  const downPaymentAmount = watch('downPayment.amount') || 0
  const mainConditionId = watch('paymentConditionId')

  // Recalcula o acréscimo de todas as parcelas: em %, ele depende do valor de
  // cada uma e da quantidade total; em R$, é por parcela (lib/paymentFee)
  const applyFees = async (rows: typeof installments) => {
    const { rows: withF, total } = await withFees(rows, mainConditionId)
    setValue('installments', withF)
    setValue('mainAdditionalFee', total)
  }

  const handleChangePaymentCondition = async (
    paymentConditionId: string,
    currentIndex: number,
  ) => {
    const data = await loadCondition(paymentConditionId)
    if (!data) return
    await applyFees(
      installments.map((row, index) =>
        index === currentIndex ? { ...row, paymentConditionId } : row,
      ),
    )
  }

  const handleInstallmentAmountChange = async (
    value: number | null,
    currentIndex: number,
  ) => {
    if (!installments || installments.length <= 1) return

    const lastIndex = installments.length - 1

    // Última parcela é somente leitura (calculada automaticamente)
    if (currentIndex === lastIndex) return

    const currentAmount = Number(value) || 0

    const totalAvailable =
      totalValue - (hasDownPayment === 'true' ? downPaymentAmount : 0)

    // Soma de todas as parcelas exceto a última, aplicando o novo valor na parcela editada
    const sumExceptLast = installments.reduce((sum, inst, idx) => {
      if (idx === lastIndex) return sum
      const amount =
        idx === currentIndex ? currentAmount : Number(inst?.amount) || 0
      return sum + amount
    }, 0)

    const lastInstallmentAmount = totalAvailable - sumExceptLast

    // Valores em centavos: a última parcela precisa de pelo menos 1 centavo
    if (lastInstallmentAmount < 1) {
      toast.error(
        'O valor inserido ultrapassa o total disponível. A última parcela não pode ficar negativa.',
      )
      // Reverter para o valor máximo permitido para essa parcela
      const previousAmount = Number(installments[currentIndex]?.amount) || 0
      const maxAllowed =
        totalAvailable -
        installments.reduce((sum, inst, idx) => {
          if (idx === lastIndex || idx === currentIndex) return sum
          return sum + (Number(inst?.amount) || 0)
        }, 0) -
        1
      setValue(
        `installments.${currentIndex}.amount`,
        Math.max(maxAllowed, previousAmount),
      )
      return
    }

    await applyFees(
      installments.map((row, index) =>
        index === currentIndex
          ? { ...row, amount: currentAmount }
          : index === lastIndex
            ? { ...row, amount: lastInstallmentAmount }
            : row,
      ),
    )
  }

  const lastIndex = installments.length - 1

  return installments.map((_, index) => {
    const isLastInstallment = index === lastIndex

    return (
      <Fragment key={index}>
        <div className="flex flex-wrap gap-3">
          <p className="text-sm font-medium text-gray-700 leading-[44px] pt-5 mr-8">
            {`${index + 1}/${installments.length}`}
          </p>
          <FormDatePickerInput
            name={`installments.${index}.dueDate`}
            label="Vencimento"
            width="flex-[1_0_130px]"
          />
          <PaymentConditionsSelectField
            name={`installments.${index}.paymentConditionId`}
            label="Forma de pagamento"
            width="flex-[1_0_200px]"
            additionalOnChange={(value) =>
              handleChangePaymentCondition(value, index)
            }
          />
          <FormBrlInput
            name={`installments.${index}.additionalFee`}
            placeholder="0,00"
            label="Acréscimo"
            startAdornment={<>R$</>}
            disabled
          />

          <PermissionGate permissions={['values:values:view']}>
            <FormBrlInput
              name={`installments.${index}.amount`}
              placeholder="0,00"
              label="Valor da parcela"
              startAdornment={<>R$</>}
              additionalOnChange={(value) =>
                handleInstallmentAmountChange(value, index)
              }
              readOnly={isLastInstallment}
            />
          </PermissionGate>
        </div>
        <Separator />
      </Fragment>
    )
  })
}
