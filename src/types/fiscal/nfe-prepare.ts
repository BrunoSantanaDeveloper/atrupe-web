// Types for NF-e prepare endpoint response

export interface NfePrepareEmissao {
  emissor: string
  emissorCnpj: string
  proximoDocumento: string
  serie: number
  tipo: number
  finalidade: number
  operationNature: string
  consumidorFinal: number
  presencaConsumidor: number
  nfeReferenciada: string | null
  dataSaida: string
  destinoOperacao: number
  modalidadeFrete: number
  ambiente: string
}

export interface NfePrepareDestinatario {
  razaoSocial: string
  cnpjCpf: string
  ie: string
  email: string
  telefone: string
  cep: string
  estado: string
  cidade: string
  bairro: string
  endereco: string
  numero: string
  complemento: string
  pais: string
}

export interface NfePrepareItem {
  itemNumber: number
  productId: string
  productCode: string
  description: string
  ncm: string
  cfop: string
  cstIcms: string
  cstIpi: string
  cstPis: string
  cstCofins: string
  unit: string
  uCom?: string
  ean?: string
  ceantrib?: string
  quantity: number
  unitValue: number
  discount: number
  freight: number
  insurance: number
  totalValue: number
  needsConfiguration: boolean
}

export interface NfePrepareTransportadora {
  cnpjCpf: string
  razaoSocial: string
  ie: string
  endereco: string
  cidade: string
  uf: string
}

export interface NfePreparePagamento {
  forma: string
  valor: number
}

export interface NfePrepareTotais {
  valorProdutos: number
  baseCalculoIcms: number
  valorIcms: number
  baseCalculoIcmsSt: number
  valorIcmsSt: number
  valorPis: number
  valorCofins: number
  valorIpi: number
  valorFrete: number
  valorSeguro: number
  outrasDesepesas: number
  valorDesconto: number
  valorTotalTributos: number
  valorNota: number
}

export interface NfePrepareExistingNfe {
  id: string
  numero: number
  serie: number
  status: string
  chaveAcesso: string
  danfeUrl: string | null
  dataEmissao: string
}

export interface NfePrepareVolume {
  quantidade: number
  especie: string
  marca: string
  numeracao: string
  pesoLiquido: number
  pesoBruto: number
}

export interface NfePrepareDuplicata {
  numero: string
  dataVencimento: string
  valor: number
}

export interface NfePrepareResponse {
  orderId: string
  quotationId: string
  orderCode: string
  hasExistingNfe: boolean
  existingNfe: NfePrepareExistingNfe | null
  emissao: NfePrepareEmissao
  destinatario: NfePrepareDestinatario
  items: NfePrepareItem[]
  transportadora: NfePrepareTransportadora
  volumes: NfePrepareVolume[]
  pagamento: NfePreparePagamento
  duplicatas: NfePrepareDuplicata[]
  autXml?: string[]
  informacoesComplementares: string
  totais: NfePrepareTotais
  // Draft fields
  draftId?: string
  isDraft?: boolean
}
