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
  enabled: boolean
  // Nome que identifica a venda de balcão quando não há cliente cadastrado
  clientName: string
  description: string
  seriesId: string
  serviceTypeId: string
  // O vendedor é sempre o usuário logado, e o responsável nasce vazio (VR-2)
  responsibleId: string | null
}
