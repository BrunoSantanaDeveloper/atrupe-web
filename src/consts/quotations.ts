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
    value: 'Contratação do frete por conta do remetente (CIF)',
    label: 'Contratação do frete por conta do remetente (CIF)',
  },
  {
    value: 'Contratação do frete por conta do destinatário (FOB)',
    label: 'Contratação do frete por conta do destinatário (FOB)',
  },
  {
    value: 'Contratação do frete por conta de terceiros',
    label: 'Contratação do frete por conta de terceiros',
  },
  {
    value: 'Transporte próprio por conta do remetente',
    label: 'Transporte próprio por conta do remetente',
  },
  {
    value: 'Transporte próprio por conta do destinatário',
    label: 'Transporte próprio por conta do destinatário',
  },
  {
    value: 'Sem ocorrência de transporte',
    label: 'Sem ocorrência de transporte',
  },
]
