import { Fragment } from 'react'
import { useFormContext } from 'react-hook-form'

import { Separator } from '@/components/ui/separator'
import { FormBrlInput } from '@/components/common/form/FormBrlInput'
import { FormDatePickerInput } from '@/components/common/form/FormDatePickerInput'
import { PaymentConditionsSelectField } from '@/components/common/form/global-inputs/PaymentConditionsSelectField'

import { QuotationPaymentConditionsType } from './schema'

export function Installments() {
  const form = useFormContext<QuotationPaymentConditionsType>()

  const { watch, setValue } = form

  const installments = watch('installments')
  const totalValue = watch('totalValue') || 0
  const hasDownPayment = watch('hasDownPayment')
  const downPaymentAmount = watch('downPayment.amount') || 0

  // Função para recalcular as parcelas quando uma parcela é alterada manualmente
  const handleInstallmentAmountChange = (
    value: number | null,
    currentIndex: number,
  ) => {
    if (!installments || installments.length <= 1) return

    // Valor atual da parcela alterada
    const currentAmount = Number(value) || 0

    // Valor total disponível para as parcelas (total - entrada)
    const totalAvailable =
      totalValue - (hasDownPayment === 'true' ? downPaymentAmount : 0)

    // Soma dos valores de todas as parcelas atuais
    const currentTotal = installments.reduce((sum, inst, idx) => {
      // Para a parcela que está sendo editada, usar o novo valor
      const amount =
        idx === currentIndex ? currentAmount : Number(inst?.amount) || 0
      return sum + amount
    }, 0)

    // Diferença entre o valor total disponível e o total atual das parcelas
    const difference = totalAvailable - currentTotal

    // Se a diferença for zero ou muito pequena, não é necessário ajustar
    if (Math.abs(difference) < 0.01) return

    // Número de parcelas restantes para distribuir a diferença
    const remainingInstallments = installments.length - 1

    // Valor a ser adicionado/subtraído de cada parcela restante
    const adjustmentPerInstallment = difference / remainingInstallments

    // Atualizar as outras parcelas
    const updatedInstallments = installments.map((inst, idx) => {
      if (idx === currentIndex) {
        // Manter o valor editado para a parcela atual
        return { ...inst, amount: currentAmount }
      } else {
        // Ajustar as outras parcelas
        const currentInstAmount = Number(inst?.amount) || 0
        const newAmount = currentInstAmount + adjustmentPerInstallment
        return { ...inst, amount: Math.max(newAmount, 0) }
      }
    })

    setValue('installments', updatedInstallments)
  }

  return installments.map((_, index) => (
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
          name="paymentConditionId"
          label="Forma de pagamento"
          width="flex-[1_0_200px]"
          disabled
        />
        <FormBrlInput
          name={`installments.${index}.additionalFee`}
          placeholder="0,00"
          label="Acréscimo"
          startAdornment={<>R$</>}
          disabled
        />
        <FormBrlInput
          name={`installments.${index}.amount`}
          placeholder="0,00"
          label="Valor da parcela"
          startAdornment={<>R$</>}
          additionalOnChange={(value) =>
            handleInstallmentAmountChange(value, index)
          }
          readOnly
        />
      </div>
      <Separator />
    </Fragment>
  ))
}
