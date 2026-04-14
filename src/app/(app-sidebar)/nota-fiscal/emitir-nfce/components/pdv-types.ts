import {
  IconCash,
  IconCreditCard,
  IconQrcode,
  IconReceipt,
} from '@tabler/icons-react'

export type PdvItem = {
  id: string
  productId: string
  codigo: string
  descricao: string
  ncm: string
  cfop: string
  unidade: string
  quantidade: number
  valorUnitario: number
  valorDesconto: number
  valorTotal: number
}

export interface EmissionResult {
  numero: string
  serie: string
  status: string
  valorTotal: number
  chaveAcesso?: string
  danfeUrl?: string
}

export type Pagamento = {
  tipo: string
  valor: number
  label: string
}

export const PAYMENT_TYPES = [
  { value: '01', label: 'Dinheiro', icon: IconCash },
  { value: '03', label: 'Cartão de Crédito', icon: IconCreditCard },
  { value: '04', label: 'Cartão de Débito', icon: IconCreditCard },
  { value: '17', label: 'PIX', icon: IconQrcode },
  { value: '99', label: 'Outros', icon: IconReceipt },
]

export const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatCpf = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}
