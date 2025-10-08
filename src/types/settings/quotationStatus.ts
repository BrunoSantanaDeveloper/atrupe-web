export type QuotationStatusType = {
  id: string
  title: string
  color: string
}

export type ListQuotationStatussType = {
  quotationTags: QuotationStatusType[]
  total: number
  page: number
  limit: number
}
