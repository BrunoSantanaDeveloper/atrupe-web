// Type
import { BadgeType } from '@/types/coreTypes'

export const quotationsStatusObj: {
  [key: string]: BadgeType
} = {
  OPEN: { text: 'Digitação', variant: 'neutralLight' },
  OVERDUE: { text: 'Vencido', variant: 'warningLight' },
  REJECTED: { text: 'Rejeitado', variant: 'errorLight' },
  APPROVED: { text: 'Aprovado', variant: 'successLight' },
  DONE: { text: 'Aguardando', variant: 'blueLight' },
  // Aprovada à espera do pagamento antecipado (PA-4, 12/11/2026)
  PENDING_PAYMENT: { text: '⚠️ Pendente', variant: 'warningLight' },
}

// export const quotationsQuotationStatusObj: {
//   [key: string]: { text: string; color: string }
// } = {
//   SENT: { text: 'Proposta enviada', color: '#DD2590' },
//   IN_PROGRESS: {
//     text: 'Em desenvolvimento',
//     color: '#119FA8',
//   },
//   NO_CLIENT: {
//     text: 'Cliente não encontrado',
//     color: '#F79009',
//   },
//   UNKNOWN: {
//     text: 'Motivo desconhecido',
//     color: '#D92D20',
//   },
// }

export const paymentConditionsTypeObj: {
  [key: string]: BadgeType
} = {
  OTHER: { text: 'A definir', variant: 'neutralLight' },
  NFE: { text: 'NF-e', variant: 'neutralLight' },
  NFSE: { text: 'NFS-e', variant: 'neutralLight' },
}

// TODO : Pegar opções em GET /quotation/delivery
export const deliveryTypeOptions = [
  {
    value: 'INSTALLATION',
    label: 'Entrega na instalação',
  },
  { value: 'CARRIER', label: 'Transportadora' },
  { value: 'PICKUP', label: 'Cliente retira' },
]

export const deliveryModalityOptions = [
  { value: 'Indefinida', label: 'Indefinida' },
  {
    value: 'Transporte próprio por conta do remetente',
    label: 'Nossa empresa entrega (veículo próprio)',
  },
  {
    value: 'Contratação do frete por conta do remetente (CIF)',
    label: 'Nossa empresa contrata transportadora (CIF)',
  },
  {
    value: 'Contratação do frete por conta do destinatário (FOB)',
    label: 'Cliente contrata transportadora (FOB)',
  },
  {
    value: 'Transporte próprio por conta do destinatário',
    label: 'Cliente retira',
  },
  {
    value: 'Sem ocorrência de transporte',
    label: 'Sem transporte',
  },
  {
    value: 'Contratação do frete por conta de terceiros',
    label: 'Frete contratado por terceiros',
  },
]
