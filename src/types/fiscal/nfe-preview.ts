/**
 * Resposta de POST /fiscal/nfe/preview.
 *
 * Os nomes seguem o layout do InvoiCy, e não os da tela, porque o backend
 * devolve o mesmo payload que seria transmitido — é isso que garante que a
 * conferência mostre a nota que vai sair, e não uma segunda versão dos dados.
 * Tudo opcional: quando a nota está bloqueada, só vêm `bloqueios` e `avisos`.
 */

export interface NfePreviewDocumento {
  modelo: string
  ambiente: 'HOMOLOGACAO' | 'PRODUCAO'
  /** Número previsto; o definitivo é reservado no momento da emissão. */
  numeroPrevisto: number
  serie: string
  naturezaOperacao: string
  /** 0 = entrada, 1 = saída. */
  tipo: number
  finalidade: number
  idDest: number
  indFinal: number
  indPres: number
  dataEmissaoPrevista: string
  dataSaidaEntrada?: string
  nfeReferenciada?: string
}

export interface NfePreviewEmitente {
  CNPJ_emit?: string
  xNome?: string
  IE?: string
  IM?: string
  CRT?: number
  enderEmit?: {
    xLgr?: string
    nro?: string
    xBairro?: string
    xMun?: string
    UF?: string
    CEP?: number
  }
}

export interface NfePreviewDestinatario {
  CNPJ_dest?: string
  CPF_dest?: string
  idEstrangeiro?: string
  xNome_dest?: string
  indIEDest?: number
  IE_dest?: string
  enderDest?: {
    xLgr_dest?: string
    nro_dest?: string
    xBairro_dest?: string
    xMun_dest?: string
    UF_dest?: string
    CEP_dest?: number
  }
}

/** Grupo de impostos do item, no formato do layout. */
export interface NfePreviewTributos {
  ICMS?: {
    orig?: number
    CST?: string
    vBC?: number
    pICMS?: number
    /** O sufixo é do layout do provedor, não engano. */
    vICMS_icms?: number
    vBCST?: number
    vICMSST_icms?: number
  }
  PIS?: { CST_pis?: string; vPIS?: number }
  COFINS?: { CST_cofins?: string; vCOFINS?: number }
  IPI?: { cEnq?: string; CSTIPI?: { CST_IPI?: string; vIPI?: number } }
  IBSCBS?: { CST?: string; cClassTrib?: string }
}

export interface NfePreviewItem {
  sequencia: number
  cProd?: string
  xProd?: string
  NCM?: string
  CFOP?: number
  uCOM?: string
  qCOM?: string
  vUnCom?: string
  vProd?: string
  cEAN?: string
  tributos?: NfePreviewTributos
}

/** Totalizadores; `ICMStot` é o grupo do layout, o resto é conveniência. */
export interface NfePreviewTotais {
  ICMStot?: {
    vBC_ttlnfe?: string
    vICMS_ttlnfe?: string
    vBCST_ttlnfe?: string
    vIPI_ttlnfe?: string
    vPIS_ttlnfe?: string
    vCOFINS_ttlnfe?: string
    vProd_ttlnfe?: string
    vDesc_ttlnfe?: string
    vNF?: string
  }
  valorProdutos?: number
  valorNota?: number
  /** Falso no Simples Nacional, em que a nota leva só os códigos. */
  temImpostoCalculado?: boolean
}

export interface NfePreviewDuplicata {
  nDup?: string
  dVenc?: string
  vDup?: string
}

export interface NfePreview {
  podeEmitir: boolean
  bloqueios: string[]
  avisos: string[]
  documento?: NfePreviewDocumento
  emitente?: NfePreviewEmitente
  destinatario?: NfePreviewDestinatario
  entrega?: Record<string, string | number | undefined> | null
  itens?: NfePreviewItem[]
  totais?: NfePreviewTotais
  transporte?: { modFrete?: string }
  pagamento?: { tPag?: string; vPag?: string }
  duplicatas?: NfePreviewDuplicata[]
  autXml?: Array<{ CNPJ?: string; CPF?: string }>
  informacoesComplementares?: string | null
  /** Payload cru, para o painel técnico. */
  payloadInvoicy?: unknown
}
