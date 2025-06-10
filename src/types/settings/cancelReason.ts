export type CancelReasonType = {
  id: string
  reason: string
}

export type ListCancelReasonType = {
  type: 'REJECTION' | 'CANCELLATION'
  reasons: CancelReasonType[]
}

export type ListCancelReasonsType = {
  data: ListCancelReasonType[]
  total: number
  lastPage: number
}
