export type PaymentConditionsType = {
  id: string
  isActive: boolean
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
  }[]
  paymentMethod: {
    id: string
    name: string
  }
  receivementType: string
  receivementDays: number
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

// export type PaymentConditionsType = {
//   id: string
//   type: string
//   billing: string
//   discount: number
//   downPayment: number
//   paymentMethod: {
//     id: string
//     name: string
//   }
//   paymentCondition: {
//     id: string
//     name: string
//   }
//   commission: {
//     type: string
//     supplierId: string
//     transferMethod: string
//     commissionType: string
//     commissionValue: number
//     totalCommision: number
//     baseValue: number
//   }
//   totalValue: number
//   finalValue: number
//   description: string
// }
