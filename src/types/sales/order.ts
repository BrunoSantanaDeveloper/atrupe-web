// import { QuotationType } from './quotation'

import { QuotationType } from './quotation'

export type OrderType = {
  id: string
  status: string
  quotation: QuotationType
}

export type OrderListType = {
  date: string
  orders: OrderType[]
}

export type ListOrdersType = {
  data: OrderListType[]
  total: number
}
