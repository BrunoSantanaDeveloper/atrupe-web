import { QuotationType } from '@/types/sales/quotation'
import { QuotationCommissionType } from './schema'

export function defaultValues(quotationData: QuotationType) {
  if (!quotationData) return {}

  const paymentConditionsBaseValue =
    quotationData.totalValue + quotationData?.deliveryInfo?.value || 0

  const discountTotal =
    quotationData.paymentConditions?.discount?.discountTotal || 0

  const addComissionValue =
    quotationData.paymentConditions?.commission?.type === 'ADD'
      ? quotationData.paymentConditions?.commission?.totalCommission || 0
      : 0

  const totalValue =
    paymentConditionsBaseValue + addComissionValue - discountTotal

  return {
    type: quotationData.paymentConditions?.type || 'NFE',
    billing: quotationData.paymentConditions?.billing || 'ON_ORDER',
    paymentMethodId: quotationData.paymentConditions?.paymentMethod?.id || '',
    paymentConditionId:
      quotationData.paymentConditions?.paymentCondition?.id || '',
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
): number => {
  const commissionPercentage = percentage / 100
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
