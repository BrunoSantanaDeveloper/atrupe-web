/**
 * Resposta de POST /fiscal/nfce/preview.
 *
 * Os nomes seguem o layout do InvoiCy, porque o backend devolve o mesmo
 * payload que seria transmitido. Tudo opcional: com a nota bloqueada só vêm
 * `bloqueios` e `avisos`.
 */

export interface NfcePreviewDocumento {
  modelo: string
  ambiente: string
  /** Número previsto; o definitivo é reservado no momento da emissão. */
  numeroPrevisto: number
  serie: string
  naturezaOperacao: string
  contingencia: boolean
}

export interface NfcePreviewItem {
  sequencia: number
  cProd?: string
  xProd?: string
  NCM?: string
  CFOP?: number
  uCOM?: string
  qCOM?: string
  vUnCom?: string
  vProd?: string
  tributos?: {
    ICMS?: { CST?: string; vICMS_icms?: number }
    PIS?: { CST_pis?: string }
    COFINS?: { CST_cofins?: string }
  }
}

export interface NfcePreviewTotais {
  ICMStot?: {
    vProd_ttlnfe?: string
    vDesc_ttlnfe?: string
    vICMS_ttlnfe?: string
    vNF?: string
  }
  valorProdutos?: number
  valorDesconto?: number
  valorNota?: number
  valorTroco?: number
  /** Falso no Simples Nacional, em que o cupom leva só os códigos. */
  temImpostoCalculado?: boolean
}

export interface NfcePreview {
  podeEmitir: boolean
  bloqueios: string[]
  avisos: string[]
  documento?: NfcePreviewDocumento
  emitente?: {
    xNome?: string
    CNPJ_emit?: string
    IE?: string
    enderEmit?: {
      xLgr?: string
      nro?: string
      xBairro?: string
      xMun?: string
      UF?: string
    }
  }
  consumidor?: {
    CPF_dest?: string
    CNPJ_dest?: string
    xNome_dest?: string
  } | null
  itens?: NfcePreviewItem[]
  totais?: NfcePreviewTotais
  pagamentos?: Array<{ tPag?: string; vPag?: string }>
  payloadInvoicy?: unknown
}
