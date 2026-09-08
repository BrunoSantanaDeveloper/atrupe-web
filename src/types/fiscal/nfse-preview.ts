/**
 * Resposta das rotas de pré-visualização da NFS-e
 * (POST /fiscal/nfse/preview, preview-consolidated e preview-full).
 *
 * Os nomes seguem o layout do InvoiCy, porque o backend devolve o mesmo RPS
 * que seria transmitido. Tudo opcional: com a nota bloqueada só vêm
 * `bloqueios` e `avisos`.
 */

export interface NfsePreviewDocumento {
  modelo: string
  ambiente: 'HOMOLOGACAO' | 'PRODUCAO'
  /** RPS previsto; o definitivo é reservado no momento da emissão. */
  rpsPrevisto: number
  rpsSerie: string
  /** Sempre nulo na prévia: quem numera a NFS-e é a prefeitura. */
  numeroNfse: number | null
  dataEmissaoPrevista?: string
  dataCompetencia?: string
  naturezaOperacao?: number
  localPrestacao?: number
  optanteSimples?: number
  regimeEspecial?: number | null
  cIndOp?: string | null
  indFinal?: number | null
  indDest?: number | null
  tpEnteGov?: number | null
  tpOper?: number | null
  regApIbsCbsSn?: number | null
}

export interface NfsePreviewPrestador {
  CNPJ_prest?: string
  xNome?: string
  IM?: string
  cMun?: number
  xMun?: string
  UF?: string
  xLgr?: string
  nro?: string
  xBairro?: string
}

export interface NfsePreviewTomador {
  TomaCNPJ?: string
  TomaCPF?: string
  TomaRazaoSocial?: string
  TomaEndereco?: string
  TomaNumero?: string
  TomaBairro?: string
  TomaxMun?: string
  TomaUF?: string
  TomaCEP?: number
}

export interface NfsePreviewServico {
  codigoServico?: string
  discriminacao?: string
  codigoMunicipio?: string | number
  nbs?: string | null
  codTribNacional?: string | null
  codTribMunicipio?: string | null
  cnae?: string | null
  cstIbsCbs?: string | null
  codClassificacao?: string | null
}

export interface NfsePreviewValores {
  valorServicos?: number
  valorDeducoes?: number
  baseCalculo?: number
  /** Nulo quando o layout manda omitir (ME/EPP do Simples sem retenção). */
  aliquotaIss?: number | null
  valorIss?: number
  issRetido?: boolean
  ibsCbs?: Record<string, unknown> | null
}

export interface NfsePreviewItem {
  ItemSeq?: number
  ItemDescricao?: string
  ItemQuantidade?: number
  ItemValorUnitario?: number
  ItemBaseCalculo?: number
  ItemvIss?: number
  ItemAliquota?: number
}

export interface NfsePreview {
  podeEmitir: boolean
  bloqueios: string[]
  avisos: string[]
  documento?: NfsePreviewDocumento
  prestador?: NfsePreviewPrestador
  tomador?: NfsePreviewTomador
  servico?: NfsePreviewServico
  itens?: NfsePreviewItem[]
  valores?: NfsePreviewValores
  payloadInvoicy?: unknown
}
