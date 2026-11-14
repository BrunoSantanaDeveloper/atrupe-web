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

// Para onde o dinheiro vai no fechamento (FC-3, CX-4): um movimento por forma
// de pagamento, cada um na conta que aceita aquela forma. O dinheiro chega à
// conta Caixa pendente de aprovação; o cartão vai à operadora pelo valor
// cheio, e a taxa só aparece na liquidação (FC-10)
export const paymentMethodDestination: Record<PaymentMethod, string> = {
  CASH: 'Caixa (gaveta) · pendente de aprovação',
  PIX: 'banco da conta padrão do PIX',
  CARD: 'operadora de cartão · valor cheio',
}

// Uma parte do recebimento. O pagamento misto (FC-9) é simplesmente mais de
// uma parte, reaproveitando a divisão de parcela que o Fluxo financeiro já tem
export type PaymentPart = {
  method: PaymentMethod
  // O que o cliente pagou. Entra sempre pelo valor cheio, inclusive no
  // cartão: a taxa não é descontada no caixa. Ela aparece na previsão do
  // caixa principal, com o líquido entre parênteses, e é confirmada na baixa,
  // quando se informa o recebido e a taxa (FC-10)
  amount: number
  // A forma do cadastro e a conta em que o valor entra (CX-2): a API guarda
  // as duas em cada parte, e o estorno volta por elas (FC-13)
  paymentConditionId?: string
  bankAccountId?: string | null
}

export type CashMovementKind = 'SALE' | 'WITHDRAWAL' | 'SUPPLY' | 'REVERSAL'

export const cashMovementLabel: Record<CashMovementKind, string> = {
  SALE: 'Recebimento',
  // Transferência (PAD-1): sai da gaveta para uma conta, ou entra nela
  WITHDRAWAL: 'Transferência · saída',
  SUPPLY: 'Transferência · entrada',
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
  // Dinheiro que entra ou sai tem origem e destino: o suprimento vem de uma
  // conta da empresa, a sangria vai para uma. Não é receita nem despesa
  account?: string
  // Arredondamento no balcão (FC-18), registrado como desconto na venda
  discount?: number
  parts: PaymentPart[]
}

// A venda esperando o caixa. Desde 26/10/2026 quem a manda para cá é a série
// de venda ("Faturar na frente de caixa", VR-5): o tipo só diz se nasceu
// como venda rápida ou como orçamento comum. O orçamento com série que
// fatura no pedido vai direto ao fluxo financeiro e não passa por aqui
export type SaleKind = 'QUICK' | 'QUOTATION'

export type PendingSale = {
  id: string
  // O orçamento de origem, para o vendedor acompanhar a venda (FC-11)
  quotationId?: string
  reference: string
  client: string
  seller: string
  kind: SaleKind
  total: number
  // Sinal já recebido (FC-6 e FC-17)
  paid: number
  delivered: boolean
  approvedAt: string
  // false = o caixa faturou para o cliente (FC-4): a venda foi para o fluxo
  // financeiro e fica aqui só como registro do dia, fora do saldo, até o
  // fechamento. O orçamento que já nasce faturado não passa pelo caixa
  goesToCash: boolean
  // Com mais de um caixa, quem puxou a venda para atender (FC-5)
  claimedBy?: string | null
  // Revertida para faturamento: a forma escolhida para o cliente (FC-4)
  billing?: string
  // Trabalho concluído e não entregue (FC-19): sai da fila "A receber" e
  // passa para "Aguardando retirada". Sem o gerenciador de produção, quem
  // marca é o caixa ou o vendedor; com ele, a conclusão da ordem marca
  ready?: boolean
  readyAt?: string
  phone?: string
}

// A venda vista do lado do vendedor, depois de sair do orçamento. Os dois
// caminhos da VR-5: cobrada na hora, pelo próprio vendedor, ou enviada à
// frente de caixa, onde quem recebe é o caixa
export type QuickSalePath = 'CASH_ONLY' | 'POS'

export type QuickSaleCheckout = {
  quotationId: string
  path: QuickSalePath
  sentAt: string
  total: number
  paid: number
  delivered: boolean
  // Cancelada no caixa, com estorno (FC-13)
  cancelled: boolean
  parts: PaymentPart[]
}

// Há quantos dias o trabalho pronto espera o cliente (FC-19)
export const daysWaiting = (sale: PendingSale) =>
  sale.readyAt
    ? Math.max(
        0,
        Math.floor((Date.now() - new Date(sale.readyAt).getTime()) / 86400000),
      )
    : 0

export type CashSession = {
  id: string
  // Número do caixa, para o nome dos movimentos do fechamento ("Fechamento FC
  // nº 12 · dinheiro")
  number: number
  name: string
  operator: string
  openedAt: string
  openingBalance: number
  status: 'OPEN' | 'CLOSED'
  // Modo de conferência do fechamento, do cadastro da frente de caixa (FC-7):
  // conferência simples (padrão) ou contagem às cegas
  blindCount: boolean
  // Tolerância da quebra, em centavos. Nula por padrão: toda diferença é
  // lançada como quebra. Com tolerância, a diferença dentro dela continua
  // aparecendo, mas não é lançada (FC-7, 30/09/2026)
  shortageTolerance: number | null
  // Limite do arredondamento no balcão, em centavos (FC-18): até ele, a
  // diferença vira desconto na venda, não quebra de caixa. Padrão R$ 1,00
  roundingLimit: number
  // O arredondamento em valor (centavos) ou em percentual do total, em
  // centésimos de ponto (FC-18)
  roundingType?: 'VALUE' | 'PERCENT'
  // Aberta num dia anterior: só fecha (FC-14)
  stale?: boolean
  closedBy?: string
  // Abrir a frente ligou o controle de caixa nesta conta (CX-1)
  controlEnabled?: string | null
  movements: CashMovement[]
  // O que explica a diferença do fechamento (fora da tolerância é obrigatória)
  closingNote?: string
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

// Limite padrão do arredondamento no balcão (FC-18): R$ 1,00
export const DEFAULT_ROUNDING_LIMIT = 100

// O limite do arredondamento para a venda: em valor ou em percentual do
// total (FC-18), como a API confere
export const roundingFor = (
  limit: number | undefined,
  type: 'VALUE' | 'PERCENT' | undefined,
  total: number,
) =>
  type === 'PERCENT'
    ? Math.floor((Math.max(0, total) * (limit ?? 0)) / 10000)
    : (limit ?? DEFAULT_ROUNDING_LIMIT)

// O cadastro da frente de caixa (FC-15)
export type CashFront = {
  id: string
  name: string
  isDefault: boolean
  isActive: boolean
  blindCount: boolean
  shortageTolerance: number | null
  roundingType: 'VALUE' | 'PERCENT'
  roundingLimit: number
  drawerAccountId: string | null
  drawerAccount: string | null
  // A conta do PIX e a do cartão desta frente (CX-2): vazias, vale a padrão
  // da forma
  pixAccountId: string | null
  pixAccount: string | null
  cardAccountId: string | null
  cardAccount: string | null
  // Há caixa aberto nela agora
  open: boolean
}

// O que o cadastro da frente envia
export type CashFrontValues = Omit<
  CashFront,
  'id' | 'open' | 'drawerAccount' | 'pixAccount' | 'cardAccount'
>
