import { FormSelect } from '@/components/common/form/FormSelect'
import { useFormContext } from 'react-hook-form'

import { QuotationPaymentConditionsType } from './schema'
import { addDays } from 'date-fns'
import { useEffect, useRef } from 'react'

import { splitCents } from '@/lib/paymentFee'
import { withFees } from './fees'

export function InstallmentQty() {
  const form = useFormContext<QuotationPaymentConditionsType>()
  const { setValue, watch } = form
  const isInitialized = useRef(false)

  const minInstallmentQty = watch('minInstallmentQty') || 1
  const maxInstallmentQty = watch('maxInstallmentQty') || 1
  const paymentConditionId = watch('paymentConditionId')
  const downPaymentValue = watch('downPayment.amount') || 0
  const totalValue = watch('totalValue') || 0
  const installmentQty = watch('installmentQty')
  const installments = watch('installments')
  const hasDownPayment = watch('hasDownPayment')
  const dayInterval = watch('dayInterval') ?? 30

  // Recalcula as parcelas: (total - entrada) dividido em centavos inteiros,
  // a diferença na última, e o acréscimo de cada uma pela regra da condição
  // (em %, pela linha "Nx"; em R$, por parcela). Preserva id, vencimento e a
  // forma de pagamento já escolhida em cada parcela.
  const recalculateInstallments = async (qty: number) => {
    if (!qty || qty <= 0) return

    const valueToDistribute =
      totalValue - (hasDownPayment === 'true' ? downPaymentValue : 0)

    const draft = splitCents(valueToDistribute, qty).map((amount, i) => ({
      id: installments?.[i]?.id,
      dueDate:
        installments?.[i]?.dueDate ||
        addDays(new Date(), dayInterval * (i + 1)),
      paymentConditionId:
        installments?.[i]?.paymentConditionId || paymentConditionId,
      amount,
    }))

    const { rows, total } = await withFees(draft, paymentConditionId)
    setValue('installments', rows, { shouldValidate: true })
    setValue('mainAdditionalFee', total)
  }

  const handleChangeInstallmentQty = async (value: string) => {
    if (!value) return
    await recalculateInstallments(Number(value))
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
      handleChangeInstallmentQty(installmentQty)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentConditionId])

  // Recalcular parcelas quando o valor total ou o valor da entrada mudar.
  // Pula a primeira execução (mount após reset do form) para não sobrescrever
  // valores salvos vindos do banco com distribuição igualitária.
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true
      return
    }

    if (
      installmentQty &&
      Number(installmentQty) > 0 &&
      installments?.length > 0
    ) {
      recalculateInstallments(Number(installmentQty))
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
