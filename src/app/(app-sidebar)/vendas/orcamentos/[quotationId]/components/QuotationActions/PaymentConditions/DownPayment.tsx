// Components
import { FormBrlInput } from '@/components/common/form/FormBrlInput'
import { FormDatePickerSingle } from '@/components/common/form/FormDatePicker'
import { getItem } from '@/actions/_cruds'
import { PaymentConditionsType } from '@/types/settings/paymentCondition'

import { useFormContext } from 'react-hook-form'
import type { QuotationPaymentConditionsType } from './schema'
import { PaymentConditionsSelectField } from '@/components/common/form/global-inputs/PaymentConditionsSelectField'
import { toast } from 'sonner'

export function DownPayment() {
  const form = useFormContext<QuotationPaymentConditionsType>()

  const { setValue, clearErrors, watch } = form

  const totalValue = watch('totalValue') || 0
  const installmentQty = watch('installmentQty')
  const installments = watch('installments') || []

  const handleChangePaymentCondition = async (paymentConditionId: string) => {
    clearErrors('downPayment.paymentConditionId')

    const res = await getItem({
      route: `/payment-condition/${paymentConditionId}`,
    })

    if (!res.success) {
      toast.error(res.message)
    }

    const data: PaymentConditionsType = res.data

    const additionalFee = data?.installments[0]?.operatorFeeTransfer || 0
    setValue('downPayment.additionalFee', additionalFee)
  }

  // Função para atualizar as parcelas quando o valor da entrada mudar
  const handleDownPaymentAmountChange = (value: number | null) => {
    const downPaymentAmount = Number(value) || 0

    // Se não houver parcelas ou quantidade de parcelas, não faz nada
    if (!installments.length || !installmentQty) return

    const qtyNumber = Number(installmentQty)

    // Valor a ser distribuído entre as parcelas (total - entrada)
    const valueToDistribute = totalValue - downPaymentAmount

    // Valor de cada parcela
    const installmentValue = valueToDistribute / qtyNumber

    // Atualizar o valor de cada parcela
    const updatedInstallments = installments.map((installment) => ({
      ...installment,
      amount: installmentValue,
    }))

    setValue('installments', updatedInstallments)
  }

  return (
    <div className="flex flex-wrap gap-3 p-6 bg-blue-light-50 rounded-xl border border-blue-light-300">
      <p className="text-sm font-medium text-gray-700 leading-[44px] pt-5">
        Entrada
      </p>
      <FormDatePickerSingle<QuotationPaymentConditionsType>
        name={`downPayment.dueDate`}
        label="Vencimento"
        width="flex-[1_0_130px]"
      />
      {/* TODO : Filtrar condições de pagamento permitidas para a entrada */}
      <PaymentConditionsSelectField<QuotationPaymentConditionsType>
        name={`downPayment.paymentConditionId`}
        label="Condição de pagamento"
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
