// Components
import { FormBrlInput } from '@/components/common/form/FormBrlInput'
import { FormDatePickerInput } from '@/components/common/form/FormDatePickerInput'

import { useFormContext } from 'react-hook-form'
import type { QuotationPaymentConditionsType } from './schema'
import { PaymentConditionsSelectField } from '@/components/common/form/global-inputs/PaymentConditionsSelectField'

import { installmentFee, splitCents } from '@/lib/paymentFee'
import { loadCondition, withFees } from './fees'

export function DownPayment() {
  const form = useFormContext<QuotationPaymentConditionsType>()

  const { setValue, clearErrors, watch, trigger } = form

  const totalValue = watch('totalValue') || 0
  const installmentQty = watch('installmentQty')
  const installments = watch('installments') || []
  const mainConditionId = watch('paymentConditionId')
  const downPaymentConditionId = watch('downPayment.paymentConditionId')
  const downPaymentAmount = watch('downPayment.amount') || 0

  // O acréscimo da entrada segue a forma de pagamento dela, à vista (1x)
  const applyDownPaymentFee = async (
    conditionId: string | undefined,
    amount: number,
  ) => {
    const data = await loadCondition(conditionId)
    setValue(
      'downPayment.additionalFee',
      data ? installmentFee(data, 1, amount) : 0,
    )
  }

  const handleChangePaymentCondition = async (paymentConditionId: string) => {
    clearErrors('downPayment.paymentConditionId')
    await applyDownPaymentFee(paymentConditionId, downPaymentAmount)
  }

  // Ao mudar o valor da entrada: o acréscimo dela e as parcelas (total -
  // entrada, em centavos inteiros) com os acréscimos recalculados
  const handleDownPaymentAmountChange = async (value: number | null) => {
    const amount = Number(value) || 0
    await applyDownPaymentFee(downPaymentConditionId, amount)

    if (!installments.length || !installmentQty) return
    const qty = Number(installmentQty)
    const draft = splitCents(totalValue - amount, qty).map(
      (parcelAmount, index) => ({
        ...installments[index],
        amount: parcelAmount,
      }),
    )
    const { rows, total } = await withFees(draft, mainConditionId)
    setValue('installments', rows)
    setValue('mainAdditionalFee', total)

    // Valida na hora: uma entrada que cobre todo o total zera as parcelas, que
    // são calculadas automaticamente e passariam despercebidas sem destaque
    trigger(['installments', 'downPayment.amount'])
  }

  return (
    <div className="flex flex-wrap gap-3 p-6 bg-blue-light-50 rounded-xl border border-blue-light-300">
      <p className="text-sm font-medium text-gray-700 leading-[44px] pt-5">
        Entrada
      </p>
      <FormDatePickerInput
        name={`downPayment.dueDate`}
        label="Vencimento"
        width="flex-[1_0_130px]"
      />
      {/* TODO : Filtrar condições de pagamento permitidas para a entrada */}
      <PaymentConditionsSelectField<QuotationPaymentConditionsType>
        name={`downPayment.paymentConditionId`}
        label="Forma de pagamento"
        width="flex-[1_0_200px]"
        additionalOnChange={handleChangePaymentCondition}
      />
      <FormBrlInput<QuotationPaymentConditionsType>
        name={`downPayment.additionalFee`}
        placeholder="0,00"
        label="Acréscimo"
        startAdornment={<>R$</>}
        disabled
      />
      <FormBrlInput<QuotationPaymentConditionsType>
        name={`downPayment.amount`}
        placeholder="0,00"
        label="Valor da entrada"
        startAdornment={<>R$</>}
        additionalOnChange={handleDownPaymentAmountChange}
      />
    </div>
  )
}
