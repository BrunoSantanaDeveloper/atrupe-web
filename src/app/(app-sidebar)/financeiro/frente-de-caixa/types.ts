// Frente de caixa (PDV) — regras FC-1 a FC-20, em
// openspec/regras-de-negocio/areas/12-recursos-do-lite.md
//
// A operação de referência é a gráfica rápida com três atendentes e uma
// pessoa no caixa: os vendedores tiram o pedido, o caixa recebe.

export type PaymentMethod = 'CASH' | 'PIX' | 'CARD'

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  CASH: 'Dinheiro',
  PIX: 'PIX',
  CARD: 'Cartão',
}

// Para onde o dinheiro vai no fechamento (FC-3): dinheiro fica no caixa
// principal, cartão e PIX vão para os bancos, cada um com o seu prazo
export const paymentMethodDestination: Record<PaymentMethod, string> = {
  CASH: 'Caixa Empresa',
  PIX: 'Banco · no mesmo dia',
  CARD: 'Banco · conforme o prazo da operadora',
}

// Uma parte do recebimento. O pagamento misto (FC-9) é simplesmente mais de
// uma parte, reaproveitando a divisão de parcela que o Fluxo financeiro já tem
export type PaymentPart = {
  method: PaymentMethod
  // O que o cliente pagou
  amount: number
  // O que entra na conta: no cartão, já deduzida a taxa (FC-10)
  netAmount: number
}

export type CashMovementKind = 'SALE' | 'WITHDRAWAL' | 'SUPPLY' | 'REVERSAL'

export const cashMovementLabel: Record<CashMovementKind, string> = {
  SALE: 'Recebimento',
  WITHDRAWAL: 'Sangria',
  SUPPLY: 'Suprimento',
  REVERSAL: 'Estorno',
}

export type CashMovement = {
  id: string
  kind: CashMovementKind
  description: string
  createdAt: string
  // Sangria, suprimento e estorno registram motivo e responsável (FC-8, FC-13)
  reason?: string
  responsible?: string
  parts: PaymentPart[]
}

// A venda esperando o caixa. O tipo decide o caminho (FC-12.1): a venda
// rápida sempre passa pelo caixa; o orçamento normal com forma de pagamento
// definida vai direto ao fluxo financeiro e aqui aparece só como registro
export type SaleKind = 'QUICK' | 'QUOTATION'

export type PendingSale = {
  id: string
  reference: string
  client: string
  seller: string
  kind: SaleKind
  total: number
  // Sinal já recebido (FC-6 e FC-17)
  paid: number
  delivered: boolean
  approvedAt: string
  // false = foi para o fluxo financeiro; entra no relatório do dia, mas não
  // no saldo do caixa
  goesToCash: boolean
}

// Trabalho pronto e não retirado (FC-19)
export type AwaitingPickup = {
  id: string
  reference: string
  client: string
  phone: string
  finishedAt: string
  remaining: number
  deadlineDays: number
  daysWaiting: number
}

export type CashSession = {
  id: string
  name: string
  operator: string
  openedAt: string
  openingBalance: number
  status: 'OPEN' | 'CLOSED'
  movements: CashMovement[]
}

const signed = (movement: CashMovement, method?: PaymentMethod) =>
  movement.parts
    .filter((part) => !method || part.method === method)
    .reduce((total, part) => total + part.amount, 0) *
  (movement.kind === 'WITHDRAWAL' || movement.kind === 'REVERSAL' ? -1 : 1)

// O saldo em dinheiro é o que o operador precisa contar no fechamento: só o
// que é espécie entra, porque cartão e PIX não estão na gaveta
export const cashOnHand = (session: CashSession) =>
  session.movements.reduce(
    (total, movement) => total + signed(movement, 'CASH'),
    session.openingBalance,
  )

export const totalByMethod = (session: CashSession, method: PaymentMethod) =>
  session.movements
    .filter((movement) => movement.kind !== 'WITHDRAWAL')
    .reduce((total, movement) => total + signed(movement, method), 0)

export const sessionTotal = (session: CashSession) =>
  session.movements.reduce((total, movement) => total + signed(movement), 0)

export const saleRemaining = (sale: PendingSale) =>
  Math.max(0, sale.total - sale.paid)
