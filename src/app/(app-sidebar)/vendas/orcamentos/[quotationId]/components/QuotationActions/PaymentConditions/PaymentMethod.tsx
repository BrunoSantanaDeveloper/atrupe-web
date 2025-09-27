import { PaymentConditionsSelectField } from '@/components/common/form/global-inputs/PaymentConditionsSelectField'

import { useFormContext } from 'react-hook-form'

import { addMonths } from 'date-fns'
import { getItemOld } from '@/actions/_cruds'

import { QuotationPaymentConditionsType } from './schema'
import { PaymentConditionsType } from '@/types/settings/paymentCondition'
import { QuotationType } from '@/types/sales/quotation'

const dueDate = new Date()

interface Props {
  quotationData: QuotationType
}

export function PaymentMethodAndCondition({ quotationData: _ }: Props) {
  const form = useFormContext<QuotationPaymentConditionsType>()
  const { setValue, watch, clearErrors } = form

  const downPaymentValue = watch('downPayment.amount') || 0
  const totalValue = watch('totalValue') || 0

  // Ao alterar a condição de pagamento:
  // - atualiza mínimo e máximo de parcelas, para limitar o preenchimento do campo Parcelas (installmentQty),
  // - redefine a quantidade de parcelas inicial como 1x,
  // - redefine o valor de acréscimo (taxa) referente à parcela máxima,
  // - redefine o valor de cada parcela, sendo: (Valor Total - Valor da Entrada) / quantidade de parcelas.
  // * O valor total esperado é Valor base - desconto + comissão.
  const handleChangePaymentCondition = async (paymentConditionId: string) => {
    clearErrors('paymentConditionId')

    const data: PaymentConditionsType = await getItemOld({
      route: 'paymentConditionRoute',
      id: paymentConditionId,
    })

    const minInstallments = data?.minInstallments || 1
    const maxInstallments = data?.maxInstallments || 1

    const additionalFee = data?.installments[0]?.operatorFeeTransfer || 0
    const additionalFeeType = data?.costType

    setValue('minInstallmentQty', minInstallments)
    setValue('maxInstallmentQty', maxInstallments)
    setValue('mainAdditionalFee', additionalFee)
    setValue('additionalFeeType', additionalFeeType)

    // Setar o valor de installmentQty, com delay para evitar que valor seja setado antes de existir as opções de qtt de parcelas
    setTimeout(() => {
      setValue('installmentQty', '1')
    }, 100)

    const newInstallments = Array.from({ length: 1 }, (_, i) => ({
      dueDate: addMonths(new Date(dueDate), i + 1),
      additionalFee,
      amount: totalValue - downPaymentValue,
    }))

    setValue('installments', newInstallments)
  }

  return (
    <PaymentConditionsSelectField<QuotationPaymentConditionsType>
      name="paymentConditionId"
      label="Condição de Pagamento"
      width="flex-[1_0_200px]"
      onChange={handleChangePaymentCondition}
    />
  )
}
