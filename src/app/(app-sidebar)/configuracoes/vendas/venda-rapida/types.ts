// Configuração da venda rápida (regras-de-negocio/areas/12-recursos-do-lite.md).
// A venda rápida pula o modal de novo orçamento: os valores que o vendedor
// deixaria de preencher ficam definidos aqui, uma vez (VR-4).

// O que acontece com o dinheiro da venda rápida (VR-5): ou ela é cobrada na
// hora, só à vista, ou ela é enviada para a frente de caixa
export type QuickSalePayment = 'CASH_ONLY' | 'POS'

export type QuickSaleSettings = {
  payment: QuickSalePayment
  // Meios aceitos quando a cobrança é na hora
  cashMethods: string[]
  // Entrada obrigatória (sinal) quando o cliente paga agora e busca depois
  // (FC-6, FC-17): um recurso habilitável, com percentual da empresa. O
  // restante é cobrado na retirada, e quem tem permissão dispensa caso a caso
  downPaymentRequired: boolean
  downPaymentPercent: number
  enabled: boolean
  // O cliente padrão da venda de balcão. Precisa ser um cliente de verdade,
  // com id: criar o orçamento exige `clientId`, não um nome digitado. Pode ser
  // a própria empresa ou um cliente final genérico, tipo "Consumidor" (ALT-22)
  clientId: string
  clientName: string
  description: string
  seriesId: string
  serviceTypeId: string
  // O vendedor é sempre o usuário logado, e o responsável nasce vazio (VR-2)
  responsibleId: string | null
}
