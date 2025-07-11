import { SelectPaymentMethodField } from '@/components/common/form/global-inputs/PaymentMethodsSelectField'
import { PaymentConditionsSelectField } from '@/components/common/form/global-inputs/PaymentConditionsSelectField'

import { useFormContext } from 'react-hook-form'

import { addMonths } from 'date-fns'
import { getItemOld } from '@/actions/_cruds'

import { QuotationPaymentConditionsType } from './schema'
import { PaymentConditionsType } from '@/types/settings/paymentCondition'
import { QuotationType } from '@/types/sales/quotation'
import { usePaymentConditions } from '@/hooks/queries/usePaymentConditions'
import { useEffect } from 'react'

const dueDate = new Date()

interface Props {
  quotationData: QuotationType
}

export function PaymentMethodAndCondition({ quotationData: _ }: Props) {
  const form = useFormContext<QuotationPaymentConditionsType>()
  const { setValue, watch, clearErrors } = form

  const paymentMethodId = watch('paymentMethodId')
  const downPaymentValue = watch('downPayment.amount') || 0
  const totalValue = watch('totalValue') || 0

  // Obter condições de pagamento disponíveis para a forma de pagamento selecionada
  const { data: paymentConditions } = usePaymentConditions({
    paymentMethodId,
    listAll: false,
  })

  const handleChangePaymentMethod = () => {
    setValue('paymentConditionId', '')
    setValue('installments', [])

    setValue('minInstallmentQty', 0)
    setValue('maxInstallmentQty', 0)
    setValue('installmentQty', '1')
    setValue('mainAdditionalFee', 0)
    setValue('additionalFeeType', 'VALUE')
  }

  // Selecionar automaticamente a primeira condição de pagamento quando uma forma de pagamento for selecionada
  useEffect(() => {
    if (paymentMethodId && paymentConditions && paymentConditions.length > 0) {
      const firstPaymentCondition = paymentConditions[0]
      if (firstPaymentCondition) {
        setValue('paymentConditionId', firstPaymentCondition.id)
        handleChangePaymentCondition(firstPaymentCondition.id)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethodId, paymentConditions, setValue])

  // Ao alterar a condição de pagamento:
  // - atualiza mínimo e máximo de parcelas, para limitar o preenchimento do campo Parcelas (installmentQty),
  // - redefine a quantidade de parcelas inicial como o número da parcela máxima,
  // - redefine o valor de acréscimo (taxa) referente à parcela máxima e divide pelas parcelas,
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

    const additionalFee =
      data?.installments[maxInstallments - 1]?.operatorFeeTransfer || 0
    const additionalFeeType = data?.costType

    setValue('minInstallmentQty', minInstallments)
    setValue('maxInstallmentQty', maxInstallments)
    setValue('mainAdditionalFee', additionalFee)
    setValue('additionalFeeType', additionalFeeType)

    // Setar o valor de installmentQty, com delay para evitar que valor seja setado antes de existir as opções de qtt de parcelas
    setTimeout(() => {
      setValue('installmentQty', String(maxInstallments))
    }, 100)

    const newInstallments = Array.from({ length: maxInstallments }, (_, i) => ({
      dueDate: addMonths(new Date(dueDate), i + 1),
      additionalFee: additionalFee / maxInstallments,
      amount: (totalValue - downPaymentValue) / maxInstallments,
    }))

    setValue('installments', newInstallments)
  }

  return (
    <>
      <SelectPaymentMethodField<QuotationPaymentConditionsType>
        name="paymentMethodId"
        label="Forma de pagamento"
        width="flex-[1_0_200px]"
        additionalOnChange={handleChangePaymentMethod}
      />

      <PaymentConditionsSelectField<QuotationPaymentConditionsType>
        name="paymentConditionId"
        label="Condição de Pagamento"
        width="flex-[1_0_200px]"
        paymentMethodId={paymentMethodId}
        onChange={handleChangePaymentCondition}
      />
    </>
  )
}
