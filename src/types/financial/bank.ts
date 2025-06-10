export type BankAccountsType = {
  id: string
  name: string
  description: null
  cashControl: boolean
  companyId: string
  bankId: string
  isActive: boolean
  bank: {
    id: string
    name: string
    code: string
    details: null
    icon: string
  }
  bankAccountCashControl: {
    id: string
    acceptPayments: boolean
    paymentType: string
    acceptIncomes: boolean
    incomeType: string
    paymentMethodId: string
    bankAccountId: string
    paymentMethod: {
      id: string
      name: string
      description: null
      createdAt: string
      isActive: boolean
      companyId: string
    }
  }[]
  cashRegister: {
    id: string
  }[]
}

export type ListBankAccountsType = {
  data: BankAccountsType[]
  total: number
  lastPage: number
}
