export type CashControlType = {
  id: string
  description: string
  status: string
  bankAccountName: string
  value: number
  transactionsAmount: number
  bank: {
    name: string
    icon: string
    code: string
  }
  openingBalance: number
  totalIncomes: number
  totalOutcomes: number
  retroactive: number
  closingBalance: number
}

export type ListCashControlDataType = {
  date: string
  cashRegisters: CashControlType[]
}

export type ListCashControlsType = {
  data: ListCashControlDataType[]
  total: number
  lastPage: number
}
