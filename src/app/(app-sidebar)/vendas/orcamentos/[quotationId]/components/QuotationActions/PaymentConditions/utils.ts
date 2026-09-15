import { QuotationType } from '@/types/sales/quotation'
import { QuotationCommissionType } from './schema'

/**
 * Partes do valor que as condições de pagamento precisam cobrir.
 *
 * Fonte única para o formulário e para a validação do checkout: as duas contas
 * já divergiram, e o checkout acusava divergência em orçamento fechado porque
 * ignorava o desconto e a entrada.
 */
export function calculatePaymentTotals(quotationData: QuotationType) {
  // Valor base para as condições de pagamento DEVE considerar os descontos DADOS AOS ITENS
  const itemsTotalValue =
    quotationData?.quotationItems?.reduce(
      (sum, item) => sum + (item?.finalValue ?? item?.totalValue ?? 0),
      0,
    ) || 0

  const paymentConditionsBaseValue =
    itemsTotalValue + (quotationData?.deliveryInfo?.value || 0)

  const discountTotal =
    quotationData?.paymentConditions?.discount?.discountTotal || 0

  const addComissionValue =
    quotationData?.paymentConditions?.commission?.type === 'ADD'
      ? quotationData?.paymentConditions?.commission?.totalCommission || 0
      : 0

  const mainAdditionalFee =
    quotationData?.paymentConditions?.mainAdditionalFee || 0
  const downPaymentAdditionalFee =
    quotationData?.paymentConditions?.downPayment?.additionalFee || 0
  const totalAdditionalFee = mainAdditionalFee + downPaymentAdditionalFee

  const totalValue =
    paymentConditionsBaseValue + addComissionValue - discountTotal

  // finalValue = base (itens+frete) + comissão ADD + acréscimos - desconto geral
  const finalValue =
    paymentConditionsBaseValue +
    addComissionValue +
    totalAdditionalFee -
    discountTotal

  return {
    itemsTotalValue,
    paymentConditionsBaseValue,
    discountTotal,
    addComissionValue,
    totalAdditionalFee,
    totalValue,
    finalValue,
  }
}

/**
 * O que o cliente efetivamente paga: entrada + parcelas.
 */
export function calculateScheduledTotal(quotationData: QuotationType) {
  const downPaymentAmount =
    quotationData?.paymentConditions?.downPayment?.amount || 0

  const installmentsTotal =
    quotationData?.paymentConditions?.installments?.reduce(
      (sum, installment) => sum + (installment?.amount || 0),
      0,
    ) || 0

  return downPaymentAmount + installmentsTotal
}

export function defaultValues(quotationData: QuotationType) {
  if (!quotationData) return {}

  const { paymentConditionsBaseValue, discountTotal, totalValue, finalValue } =
    calculatePaymentTotals(quotationData)

  return {
    type: quotationData.paymentConditions?.type || 'NFE',
    billing: quotationData.paymentConditions?.billing || 'ON_ORDER',
    paymentConditionId:
      (quotationData.paymentConditions?.installmentQty > 0 && // TODO: Remover
        quotationData.paymentConditions?.paymentCondition?.id) ||
      '',
    installmentQty: String(
      quotationData.paymentConditions?.installmentQty || '1',
    ),
    hasDownPayment: quotationData.paymentConditions?.downPayment
      ? 'true'
      : 'false',

    commission: quotationData.paymentConditions?.commission
      ? {
          type: quotationData.paymentConditions?.commission.type,
          supplier: {
            label: quotationData.paymentConditions?.commission.supplier.name,
            value: quotationData.paymentConditions?.commission.supplier.id,
          },
          transferMethod:
            quotationData.paymentConditions?.commission.transferMethod,
          commissionType:
            quotationData.paymentConditions?.commission.commissionType,
          commissionValue:
            quotationData.paymentConditions?.commission.commissionValue,
          totalCommission:
            quotationData.paymentConditions?.commission.totalCommission,
        }
      : null,

    discount: {
      discountType:
        quotationData.paymentConditions?.discount?.discountType || 'VALUE',
      discountValue:
        quotationData.paymentConditions?.discount?.discountValue || 0,
      discountTotal,
    },

    totalValue,
    finalValue,

    downPayment: {
      dueDate: new Date(
        quotationData.paymentConditions?.downPayment?.dueDate || new Date(),
      ),
      paymentConditionId:
        quotationData.paymentConditions?.downPayment?.paymentConditionId || '',
      additionalFee:
        quotationData.paymentConditions?.downPayment?.additionalFee || 0,
      amount: quotationData.paymentConditions?.downPayment?.amount || 0,
    },

    installments: quotationData.paymentConditions?.installments
      ? quotationData.paymentConditions?.installments.map((installment) => ({
          id: installment.id,
          dueDate: new Date(installment.dueDate),
          paymentConditionId:
            installment.paymentConditionId ||
            quotationData.paymentConditions?.paymentCondition?.id ||
            '',
          additionalFee: installment.additionalFee,
          amount: installment.amount,
        }))
      : [],

    description: quotationData.paymentConditions?.description || '',
    // finalValue: quotationData.paymentConditions?.finalValue || 0,

    minInstallmentQty: quotationData.paymentConditions?.minInstallmentQty || 1,
    maxInstallmentQty: quotationData.paymentConditions?.maxInstallmentQty || 1,
    mainAdditionalFee: quotationData.paymentConditions?.mainAdditionalFee || 0,
    additionalFeeType:
      quotationData.paymentConditions?.additionalFeeType || 'VALUE',

    // Este valor não vai ser enviado para o backend
    paymentConditionsBaseValue,
  }
}

// totalValue é = (itens do orçamento) - (desconto dos itens) + (comissão).
// finalValue é = Valor base + frete + comissão + acréscimos + desconto do orçamento.

// ** Valor base se refere à (soma dos valores dos itens) - (desconto dos itens)

// Função auxiliar para calcular comissão por porcentagem
export const calculatePercentCommission = (
  baseValue: number,
  percentage: number,
  type?: 'ADD' | 'SUB',
): number => {
  const commissionPercentage = percentage / 100

  // Se for tipo SUB, calcula percentual direto do valor base
  if (type === 'SUB') {
    return baseValue * commissionPercentage
  }

  // Se for tipo ADD (ou não especificado), mantém o cálculo anterior
  // onde o percentual é adicionado ao valor final
  return baseValue / (1 - commissionPercentage) - baseValue
}

export function defaultCommissionValues(
  commission: QuotationCommissionType,
  commissionBaseValue: number,
) {
  return {
    type: commission?.type || 'ADD',
    baseValue: commissionBaseValue || 0,
    supplier: commission?.supplier?.value
      ? { value: commission.supplier.value, label: commission.supplier.label }
      : null,
    transferMethod: commission?.transferMethod || 'SINGLE',
    commissionType: commission?.commissionType || 'PERCENT',
    commissionValue: commission?.commissionValue || 0,
    totalCommission: commission?.totalCommission || 0,
  }
}
