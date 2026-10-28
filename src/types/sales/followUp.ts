// Acompanhamento comercial, CRM fase 2 (área 13 das regras, 27/10/2026).
// O contato registrado na negociação, a linha do tempo, os totais da aba
// Aguardando e a configuração (modelos de mensagem, e-mail diário).

export type ContactChannel = 'WHATSAPP' | 'PHONE' | 'EMAIL' | 'IN_PERSON'
export type ContactOutcome =
  | 'WAITING_CLIENT'
  | 'ADJUST_REQUESTED'
  | 'WILL_CLOSE'
  | 'NO_RESPONSE'
  | 'OTHER'

export const contactChannelLabel: Record<ContactChannel, string> = {
  WHATSAPP: 'WhatsApp',
  PHONE: 'Telefone',
  EMAIL: 'E-mail',
  IN_PERSON: 'Presencial',
}

export const contactOutcomeLabel: Record<ContactOutcome, string> = {
  WAITING_CLIENT: 'Aguardando retorno',
  ADJUST_REQUESTED: 'Pediu ajuste',
  WILL_CLOSE: 'Vai fechar',
  NO_RESPONSE: 'Sem retorno',
  OTHER: 'Outro',
}

export type ContactTimelineItem = {
  kind: 'contact'
  id: string
  at: string
  channel: ContactChannel
  outcome: ContactOutcome
  note: string | null
  by: string | null
}

export type EventTimelineItem = {
  kind: 'event'
  id: string
  at: string
  action: string
  description: string
  by: string | null
}

export type TimelineItem = ContactTimelineItem | EventTimelineItem

export type QuotationTimeline = {
  contacts: number
  items: TimelineItem[]
}

export type ClientTimeline = {
  client: {
    id: string
    name: string
    mobile: string | null
    phone: string | null
  }
  lastPurchase: {
    quotationId: string
    reference: string
    description: string | null
    at: string | null
    value: number
    daysSince: number | null
  } | null
  openNegotiations: number
  items: (Omit<ContactTimelineItem, 'kind'> & {
    quotation: {
      id: string
      reference: string
      description: string | null
      status: string
    }
  })[]
}

// Os números da aba Aguardando e do contador do menu (CRM-2, CRM-3)
export type FollowUpSummary = {
  due: number
  overdue: number
  expiring: number
  noContact: number
  waiting: number
}

export type FollowUpSettings = {
  templateProposalSent: string
  templateValidity: string
  templateResume: string
  dailyEmail: boolean
  dailyEmailHour: number
  inactiveDays: number
}

export type RegisterContactBody = {
  channel: ContactChannel
  outcome: ContactOutcome
  note?: string
  nextContactAt?: string | null
  nextContactNote?: string | null
  tagId?: string | null
}

// O último contato, como vem na lista de orçamentos
export type LastContact = {
  at: string
  channel: ContactChannel
  outcome: ContactOutcome
}
