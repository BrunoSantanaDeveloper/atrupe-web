export type PaymentConditionsType = {
  id: string
  name: string
  acceptInstallments: boolean
  costType: 'PERCENT' | 'VALUE'
  minInstallments: number
  maxInstallments: number
  receivingType: string
  dayInterval: number
  installments: {
    id: string
    installment: number
    dueDate: Date
    operatorFeeRate: number
    operatorFeeTransfer: number
    paymentConditionId: string
  }[]
  paymentMethod: {
    id: string
    name: string
  }
  // para orçamento
  type: string
  billing: string
  discount: number
  discountType: string
  downPayment: number
  downPaymentType: string
  totalValue: number
  finalValue: number
  commission: {
    type: string
    supplierId: string
    transferMethod: string
    commissionType: string
    commissionValue: number
    totalCommision: number
  }
}

export type ListPaymentConditionsType = {
  paymentMethod: {
    id: string
    name: string
  }
  conditions: PaymentConditionsType[]
}
