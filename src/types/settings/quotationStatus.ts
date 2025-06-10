export type QuotationStatusType = {
  id: string
  title: string
  color: string
}

export type ListQuotationStatussType = {
  statusQuotations: QuotationStatusType[]
  total: number
  page: number
  limit: number
}
