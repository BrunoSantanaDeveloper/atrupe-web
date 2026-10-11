// Configuração de país (regras-de-negocio/areas/10-idioma-e-pais.md).
//
// O sistema atende só o Brasil hoje, e não há plano de mudar isso agora. Este
// arquivo existe para que a regra brasileira fique em UM lugar, em vez de
// espalhada pelas telas: moeda, documento da empresa e módulos que só fazem
// sentido aqui. Atender outro país passa a ser acrescentar uma configuração,
// não caçar condição no código.
//
// Regra de construção: tela nova não escreve "R$", não valida CNPJ direto e
// não decide por país. Ela lê daqui.

export type CountryCode = 'BR'

export type CountryConfig = {
  code: CountryCode
  name: string
  // Formatação de número, moeda e data
  locale: string
  currency: string
  // Documento da empresa e do cliente, como o país chama
  companyDocumentLabel: string
  personDocumentLabel: string
  // Módulos que existem por causa da legislação local. O que não estiver aqui
  // não aparece quando o país mudar
  modules: {
    // Nota fiscal eletrônica (NF-e, NFC-e, NFS-e) e a integração com a Migrate
    taxInvoice: boolean
    // Encargos da CLT na folha: INSS, FGTS, 13º e férias
    payrollCharges: boolean
    // Busca de endereço por CEP e código de município do IBGE
    postalCodeLookup: boolean
  }
}

export const countries: { [key in CountryCode]: CountryConfig } = {
  BR: {
    code: 'BR',
    name: 'Brasil',
    locale: 'pt-BR',
    currency: 'BRL',
    companyDocumentLabel: 'CNPJ',
    personDocumentLabel: 'CPF',
    modules: {
      taxInvoice: true,
      payrollCharges: true,
      postalCodeLookup: true,
    },
  },
}

// Enquanto a empresa não tiver país cadastrado, o padrão é o Brasil. Quando o
// campo existir na API, é só trocar esta função por uma leitura da sessão.
export const currentCountry = (): CountryConfig => countries.BR
