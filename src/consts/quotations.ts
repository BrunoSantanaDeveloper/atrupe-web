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

export const serviceOptions = [
  { value: 'direct', label: 'Venda Direta' },
  {
    value: 'email',
    label: 'E-mail',
  },
  {
    value: 'phone',
    label: 'Telefone',
  },
  {
    value: 'whatsapp',
    label: 'WhatsApp',
  },
  {
    value: 'instagram',
    label: 'Instagram',
  },
  {
    value: 'facebook',
    label: 'Facebook',
  },
  {
    value: 'linkedin',
    label: 'LinkedIn',
  },
  {
    value: 'telegram',
    label: 'Telegram',
  },
  {
    value: 'twitter',
    label: 'Twitter',
  },
  {
    value: 'youtube',
    label: 'YouTube',
  },
  {
    value: 'other',
    label: 'Outro',
  },
]
