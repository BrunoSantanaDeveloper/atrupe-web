import { PaymentConditionsSelectField } from '@/components/common/form/global-inputs/PaymentConditionsSelectField'

import { useFormContext } from 'react-hook-form'

import { addDays } from 'date-fns'

import { QuotationPaymentConditionsType } from './schema'
import { QuotationType } from '@/types/sales/quotation'
import { installmentFee } from '@/lib/paymentFee'
import { loadCondition } from './fees'

interface Props {
  quotationData: QuotationType
}

export function PaymentMethodAndCondition({ quotationData: _ }: Props) {
  const form = useFormContext<QuotationPaymentConditionsType>()
  const { setValue, watch, clearErrors } = form

  const downPaymentValue = watch('downPayment.amount') || 0
  const totalValue = watch('totalValue') || 0

  // Ao alterar a condição de pagamento:
  // - atualiza mínimo e máximo de parcelas, para limitar o campo Parcelas,
  // - volta a quantidade de parcelas para 1x,
  // - calcula o acréscimo pela regra da condição (lib/paymentFee),
  // - monta a parcela única com (Valor Total - Entrada).
  const handleChangePaymentCondition = async (paymentConditionId: string) => {
    clearErrors('paymentConditionId')

    const data = await loadCondition(paymentConditionId)
    if (!data) return

    const minInstallments = data.minInstallments || 1
    const maxInstallments = data.maxInstallments || 1
    const dayInterval = data.dayInterval ?? 30
    const amount = totalValue - downPaymentValue
    const additionalFee = installmentFee(data, 1, amount)

    setValue('minInstallmentQty', minInstallments)
    setValue('maxInstallmentQty', maxInstallments)
    setValue('mainAdditionalFee', additionalFee)
    setValue('additionalFeeType', data.costType)
    setValue('dayInterval', dayInterval)

    // Setar o valor de installmentQty, com delay para evitar que valor seja setado antes de existir as opções de qtt de parcelas
    setTimeout(() => {
      setValue('installmentQty', '1')
    }, 100)

    setValue('installments', [
      {
        dueDate: addDays(new Date(), dayInterval),
        paymentConditionId,
        additionalFee,
        amount,
      },
    ])
  }

  return (
    <PaymentConditionsSelectField<QuotationPaymentConditionsType>
      name="paymentConditionId"
      label="Forma de pagamento"
      width="flex-[1_0_150px]"
      additionalOnChange={handleChangePaymentCondition}
    />
  )
}
