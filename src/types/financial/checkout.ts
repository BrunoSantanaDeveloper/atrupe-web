export type CheckoutType = {
  id: string
  company: string
  description: string
  value: number
  status: string
  openValue: number
  inflow: number
  outflow: number
  notes: string
}

export type ListCheckoutDataType = {
  date: string
  registers: CheckoutType[]
}

export type ListCheckoutsType = {
  data: ListCheckoutDataType[]
  total: number
}
