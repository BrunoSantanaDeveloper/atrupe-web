import { FormSelect } from '@/components/common/form/FormSelect'
import { useFormContext } from 'react-hook-form'

import { QuotationPaymentConditionsType } from './schema'
import { addMonths } from 'date-fns'
import { getItem } from '@/actions/_cruds'
import { PaymentConditionsType } from '@/types/settings/paymentCondition'
import { useEffect } from 'react'
import { toast } from 'sonner'

const dueDate = new Date()

export function InstallmentQty() {
  const form = useFormContext<QuotationPaymentConditionsType>()
  const { setValue, watch } = form

  const minInstallmentQty = watch('minInstallmentQty') || 1
  const maxInstallmentQty = watch('maxInstallmentQty') || 1
  const paymentConditionId = watch('paymentConditionId')
  const downPaymentValue = watch('downPayment.amount') || 0
  const totalValue = watch('totalValue') || 0
  const installmentQty = watch('installmentQty')
  const installments = watch('installments')
  const hasDownPayment = watch('hasDownPayment')

  // Função para recalcular os valores das parcelas
  const recalculateInstallments = async (
    qty: number,
    additionalFee: number = 0,
  ) => {
    if (!qty || qty <= 0) return

    // Valor a ser dividido entre as parcelas (total - entrada)
    const valueToDistribute =
      totalValue - (hasDownPayment === 'true' ? downPaymentValue : 0)

    // Valor de cada parcela
    const installmentValue = valueToDistribute / qty

    // Criar novas parcelas com valores atualizados
    const newInstallments = Array.from({ length: qty }, (_, i) => ({
      // Preservar o ID se existir
      id: installments?.[i]?.id,
      // Preservar a data de vencimento se existir, ou criar uma nova
      dueDate:
        installments?.[i]?.dueDate || addMonths(new Date(dueDate), i + 1),
      additionalFee: additionalFee / qty,
      amount: installmentValue,
    }))

    setValue('installments', newInstallments)
  }

  const handleChangeInstallmentQty = async (value: string) => {
    if (!value) return

    const qtyNumber = Number(value)

    // Recalcular parcelas de acordo com número de parcelas selecionado
    // Primeiro, pegar a taxa de acréscimo de acordo com a quantidade de parcelas
    const res = await getItem({
      route: `/payment-condition/${paymentConditionId}`,
    })

    if (!res.success) {
      toast.error(res.message)
    }

    const data: PaymentConditionsType = res.data

    const additionalFee =
      data?.installments[qtyNumber - 1]?.operatorFeeTransfer || 0

    setValue('mainAdditionalFee', additionalFee)

    // Recalcular os valores das parcelas
    recalculateInstallments(qtyNumber, additionalFee)
  }

  // Gerar parcelas automaticamente quando o dialog abre sem parcelas existentes
  // mas com uma condição de pagamento selecionada (Workaround implementado para task AT-340)
  useEffect(() => {
    if (
      paymentConditionId &&
      installmentQty &&
      Number(installmentQty) > 0 &&
      (!installments || installments.length === 0)
    ) {
      // Gerar parcelas iniciais
      handleChangeInstallmentQty(installmentQty)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentConditionId])

  // Recalcular parcelas quando o valor total ou o valor da entrada mudar
  useEffect(() => {
    if (
      installmentQty &&
      Number(installmentQty) > 0 &&
      installments?.length > 0
    ) {
      // Usar o valor de acréscimo atual para manter consistência
      const currentAdditionalFee = installments[0]?.additionalFee || 0
      recalculateInstallments(
        Number(installmentQty),
        currentAdditionalFee * Number(installmentQty),
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalValue, downPaymentValue, hasDownPayment])

  // Criar array de opções do mínimo ao máximo de parcelas
  const installmentOptions = Array.from(
    { length: maxInstallmentQty - minInstallmentQty + 1 },
    (_, i) => ({
      value: String(i + minInstallmentQty),
      label: `${i + minInstallmentQty}x`,
    }),
  )

  return (
    <FormSelect<QuotationPaymentConditionsType>
      name="installmentQty"
      label="Parcelas"
      width="flex-[1_0_40px]"
      options={installmentOptions}
      disabled={!paymentConditionId}
      additionalOnChange={handleChangeInstallmentQty}
    />
  )
}
