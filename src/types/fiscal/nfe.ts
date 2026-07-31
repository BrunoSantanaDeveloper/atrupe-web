export type NfeStatus =
  | 'DRAFT'
  | 'VALIDATED'
  | 'SIGNED'
  | 'TRANSMITTED'
  | 'PROCESSING'
  | 'AUTHORIZED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'DENIED'
  | 'ERROR'
  | 'CORRECTION_SENT'

export type NfeCorrectionStatus = 'PENDING' | 'REGISTERED' | 'REJECTED'

export interface NfeCorrectionEvent {
  id: string
  nfeId: string
  sequenciaEvento: number
  correcao: string
  status?: NfeCorrectionStatus
  protocolo?: string
  dataEvento?: string
  motivoRejeicao?: string | null
  sitCodigo?: number | null
  ambiente?: number | null
  createdBy?: string | null
  createdByName?: string | null
  createdAt: string
  hasXml?: boolean
}

export interface Nfe {
  id: string
  companyId: string
  orderId?: string
  quotationId?: string
  numero: number
  serie: number
  status: NfeStatus
  ambiente: 'HOMOLOGACAO' | 'PRODUCAO'

  // Chaves e Protocolos
  chaveAcesso?: string
  protocolo?: string
  invoicyId?: string
  invoicyProtocol?: string

  // Datas
  dataEmissao?: string
  dataAutorizacao?: string
  dataCancelamento?: string

  // Valores
  valorTotal: number

  // URLs
  danfeUrl?: string
  xmlAutorizado?: string

  // Motivos
  motivoRejeicao?: string
  motivoCancelamento?: string

  // Histórico de Correções
  cartaCorrecao?: string
  dataCorrecao?: string
  protocoloCorrecao?: string
  sequenciaCorrecao?: number
  correctionEvents?: NfeCorrectionEvent[]

  // Relations (simplified)
  quotation?: {
    client?: {
      name: string
      corporateName?: string
    }
  }
}

export interface Nfce {
  id: string
  companyId: string
  orderId?: string
  quotationId?: string
  numero: number
  serie: number
  status: NfeStatus // Reusing NfeStatus for simplicity as they are likely similar
  ambiente: 'HOMOLOGACAO' | 'PRODUCAO'

  // Chaves e Protocolos
  chaveAcesso?: string
  protocolo?: string
  invoicyId?: string
  invoicyProtocol?: string

  // Datas
  dataEmissao?: string
  dataAutorizacao?: string

  // Valores
  valorTotal: number

  // URLs
  danfeUrl?: string
  xmlAutorizado?: string
  qrCodeUrl?: string
  urlConsulta?: string

  // Motivos
  motivoRejeicao?: string
  motivoCancelamento?: string

  // Relations
  quotation?: {
    client?: {
      name: string
      corporateName?: string
    }
  }
}

export interface NfeFilterDto {
  page?: number
  limit?: number
  status?: NfeStatus
  numero?: number
  startDate?: string
  endDate?: string
  orderId?: string
}
