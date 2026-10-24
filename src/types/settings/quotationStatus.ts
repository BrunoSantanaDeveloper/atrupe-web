export type QuotationStatusType = {
  id: string
  title: string
  color: string
  // Quantos orçamentos em negociação têm este marcador (GET /sale/status)
  quotations?: number
}

export type ListQuotationStatussType = {
  quotationTags: QuotationStatusType[]
  total: number
  page: number
  limit: number
}
