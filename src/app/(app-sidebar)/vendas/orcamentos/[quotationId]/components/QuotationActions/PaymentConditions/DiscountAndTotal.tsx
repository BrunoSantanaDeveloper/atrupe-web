// Components
import { FormInput } from '@/components/common/form/FormInput'
import { FormBrlInput } from '@/components/common/form/FormBrlInput'
import { PickValuePercentSelect } from '@/components/common/PickValuePercentSelect'

import { useFormContext } from 'react-hook-form'

import type { QuotationPaymentConditionsType } from './schema'
import { calculatePercentCommission } from './utils'

// Types
import type { QuotationType } from '@/types/sales/quotation'

interface Props {
  addComissionValue: number
  quotationData: QuotationType
}

export function DiscountAndTotal({ addComissionValue, quotationData }: Props) {
  const form = useFormContext<QuotationPaymentConditionsType>()

  const { watch, setValue } = form

  const baseValue = watch('paymentConditionsBaseValue') || 0
  const discountType = watch('discount.discountType')
  const discountTotal = watch('discount.discountTotal') || 0
  const installmentQty = watch('installmentQty')
  const installments = watch('installments') || []
  const hasDownPayment = watch('hasDownPayment')
  const downPaymentAmount = watch('downPayment.amount') || 0
  const commission = watch('commission')

  // Calcular o valor original sem nenhum desconto (soma dos totalValue dos produtos)
  const originalValue =
    quotationData?.quotationItems?.reduce(
      (sum, item) => sum + (item?.totalValue || 0),
      0,
    ) || 0

  // Calcular o desconto total dos itens (soma das diferenças entre totalValue e finalValue)
  const itemsDiscountTotal =
    quotationData?.quotationItems?.reduce((sum, item) => {
      const itemDiscount = (item?.totalValue || 0) - (item?.finalValue || 0)
      return sum + Math.max(itemDiscount, 0)
    }, 0) || 0

  // Desconto total combinado (itens + desconto geral)
  const combinedDiscountTotal = itemsDiscountTotal + discountTotal

  // Calcular o percentual de desconto total
  const totalDiscountPercentage =
    originalValue > 0 ? (combinedDiscountTotal / originalValue) * 100 : 0

  // Limite máximo de desconto do vendedor
  const maxDiscount = quotationData?.seller?.maxDiscount

  // Verificar se o desconto excede o limite
  const exceedsMaxDiscount =
    maxDiscount !== null &&
    maxDiscount !== undefined &&
    totalDiscountPercentage > maxDiscount

  // Função para atualizar as parcelas quando o valor total mudar
  const updateInstallments = (newTotalValue: number) => {
    // Se não houver parcelas ou quantidade de parcelas, não faz nada
    if (!installments.length || !installmentQty) return

    const qtyNumber = Number(installmentQty)

    // Valor a ser distribuído entre as parcelas (total - entrada)
    const valueToDistribute =
      newTotalValue - (hasDownPayment === 'true' ? downPaymentAmount : 0)

    // Valor de cada parcela
    const installmentValue = valueToDistribute / qtyNumber

    // Atualizar o valor de cada parcela
    const updatedInstallments = installments.map((installment) => ({
      ...installment,
      amount: installmentValue,
    }))

    setValue('installments', updatedInstallments)
  }

  // Função para recalcular a comissão quando o valor base ou desconto mudar
  const recalculateCommission = (newBaseValue: number) => {
    // Se não houver comissão ou não for do tipo percentual, não faz nada
    if (!commission || commission.commissionType !== 'PERCENT') return

    // Calcular o novo valor da comissão usando a função utilitária
    const newCommissionTotal = calculatePercentCommission(
      newBaseValue,
      commission.commissionValue,
      commission.type || undefined,
    )

    // Atualizar o valor total da comissão
    setValue('commission.totalCommission', newCommissionTotal)

    // Retornar o novo valor total da comissão para ser usado no cálculo do valor total
    return newCommissionTotal
  }

  // Calcula o valor total ao alterar o desconto
  const handleDiscountChange = (value: string | number | null) => {
    const inputDiscount = Number(value) || 0

    let discountTotal = 0
    let newTotalValue = 0

    if (discountType === 'VALUE') {
      // Para desconto em valor, o total do desconto é exatamente o valor inserido
      discountTotal = inputDiscount
      // Valor total = valor base - desconto
      newTotalValue = Math.max(baseValue - discountTotal, 0)
    } else if (discountType === 'PERCENT') {
      // Para desconto em percentual, calculamos o valor do desconto baseado no percentual
      const discountPercentage = inputDiscount / 100
      discountTotal = baseValue * discountPercentage
      // Valor total = valor base - valor calculado do desconto
      newTotalValue = Math.max(baseValue - discountTotal, 0)
    }

    // Recalcular a comissão se for do tipo percentual
    let newCommissionValue = 0
    if (
      commission?.type === 'ADD' &&
      commission?.commissionType === 'PERCENT'
    ) {
      // Valor base para comissão = valor base - desconto
      const commissionBaseValue = newTotalValue
      newCommissionValue = recalculateCommission(commissionBaseValue) || 0
    } else if (
      commission?.type === 'ADD' &&
      commission?.commissionType === 'VALUE'
    ) {
      // Para comissão em valor fixo, mantemos o valor atual
      newCommissionValue = commission.totalCommission || 0
    }

    // Adicionar valor da comissão ao total apenas se for do tipo ADD
    const finalTotalValue =
      newTotalValue + (commission?.type === 'ADD' ? newCommissionValue : 0)

    // Atualizar o valor total e o desconto total
    setValue('totalValue', finalTotalValue)
    setValue('discount.discountTotal', discountTotal)

    // Atualizar as parcelas com o novo valor total
    updateInstallments(finalTotalValue)
  }

  // Calcula o desconto ao alterar o valor total
  const handleTotalValueChange = (value: number | null) => {
    const totalValue = Number(value) || 0

    // Remover a comissão do valor total para calcular o desconto corretamente
    const totalWithoutCommission = totalValue - addComissionValue

    let newDiscount = 0
    let discountTotal = 0

    if (discountType === 'VALUE') {
      // Para desconto em valor, calculamos diretamente a diferença
      newDiscount = Math.max(baseValue - totalWithoutCommission, 0)
      discountTotal = newDiscount
    } else if (discountType === 'PERCENT') {
      // Para desconto percentual, calculamos a porcentagem em relação ao valor base
      if (baseValue > 0) {
        // Evitar divisão por zero
        newDiscount = Math.max(
          ((baseValue - totalWithoutCommission) / baseValue) * 100,
          0,
        )
        discountTotal = (newDiscount / 100) * baseValue
      } else {
        newDiscount = 0
        discountTotal = 0
      }
    }

    // Recalcular a comissão se for do tipo percentual
    if (
      commission?.type === 'ADD' &&
      commission?.commissionType === 'PERCENT'
    ) {
      // Valor base para comissão = valor total sem comissão
      const commissionBaseValue = totalWithoutCommission
      recalculateCommission(commissionBaseValue)
    } else if (
      commission?.type === 'ADD' &&
      commission?.commissionType === 'VALUE'
    ) {
      // Para comissão em valor fixo, não precisamos fazer nada
      // A comissão já está incluída no addComissionValue
    }

    // Atualizar o valor do desconto e o desconto total
    setValue('discount.discountValue', Number(newDiscount.toFixed(4)))
    setValue('discount.discountTotal', discountTotal)

    // Atualizar as parcelas com o novo valor total
    updateInstallments(totalValue)
  }

  // Mensagem de erro do desconto
  const discountErrorMessage = exceedsMaxDiscount
    ? `Desconto total (${totalDiscountPercentage.toFixed(1)}%) excede o limite do vendedor (${maxDiscount}%)`
    : undefined

  return (
    <>
      <div className="flex-[1_0_200px]">
        {discountType === 'VALUE' ? (
          <FormBrlInput<QuotationPaymentConditionsType>
            name="discount.discountValue"
            label="Desconto"
            className="[&>input]:-ml-1"
            additionalOnChange={handleDiscountChange}
            startAdornment={
              <PickValuePercentSelect
                name="discount.discountType"
                onChange={() => {
                  setValue('discount.discountValue', 0)
                  setValue('discount.discountTotal', 0)
                  handleDiscountChange(0)
                }}
              />
            }
          />
        ) : (
          <FormInput<QuotationPaymentConditionsType>
            type="number"
            name="discount.discountValue"
            label="Desconto"
            additionalOnChange={handleDiscountChange}
            startAdornment={
              <PickValuePercentSelect
                name="discount.discountType"
                onChange={() => {
                  setValue('discount.discountValue', 0)
                  setValue('discount.discountTotal', 0)
                  handleDiscountChange(0)
                }}
              />
            }
          />
        )}
        {discountErrorMessage && (
          <p className="mt-1 text-xs text-error">{discountErrorMessage}</p>
        )}
      </div>

      <FormBrlInput<QuotationPaymentConditionsType>
        name="totalValue"
        label="Valor Total"
        startAdornment={<>R$</>}
        width="flex-[1_0_200px]"
        additionalOnChange={handleTotalValueChange}
      />
    </>
  )
}
