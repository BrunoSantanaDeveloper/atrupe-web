// Contas bancárias e controle de caixa — regras CX-0 a CX-5, em
// openspec/regras-de-negocio/areas/12-recursos-do-lite.md, com base no
// levantamento do legado (legado-controle-de-caixa.md).
//
// O princípio (CX-0): controle é habilitável. O que o sistema faz sozinho vale
// para todas as contas; o que exige disciplina ou pode travar uma baixa vale
// só nas contas com controle ligado.

// O tipo da conta decide como o dia se fecha (CX-3): a gaveta se conta, o
// banco se concilia com o extrato, e a operadora de cartão não fecha — o dia
// mostra só o total que entrou, e a conferência acontece na liquidação (FC-10)
export type AccountKind = 'CASH' | 'BANK' | 'CARD'

export const accountKindLabel: Record<AccountKind, string> = {
  CASH: 'Caixa físico',
  BANK: 'Banco',
  CARD: 'Operadora de cartão',
}

// Como a baixa acontece na conta: compensada na hora ou provisionada, para
// compensar quando o dinheiro cair
export type SettleMode = 'PAYSOFF' | 'PROVISION'

export const settleModeLabel: Record<SettleMode, string> = {
  PAYSOFF: 'Compensar na baixa',
  PROVISION: 'Provisionar na baixa',
}

// O que a conta faz com cada forma de pagamento, em receitas e em despesas
export type MethodRule = {
  // O id da regra gravada (a API distingue editar de criar por ele)
  ruleId?: string
  methodId: string
  methodName: string
  acceptIncomes: boolean
  incomeType: SettleMode
  acceptPayments: boolean
  paymentType: SettleMode
  // Conta que vem pré-selecionada ao receber nesta forma. Não trava a
  // escolha: com várias contas aceitando PIX, o usuário escolhe em qual
  // recebeu; a padrão vale onde ninguém escolhe (CX-2)
  isDefault: boolean
}

export type BankAccount = {
  id: string
  name: string
  kind: AccountKind
  bankName: string
  bankCode: string
  // Chave do logo em `bankIcons` (src/consts/cashControl.ts), como no resto
  // do sistema
  bankIcon: string
  // Ligado, a conta segue as regras que exigem disciplina: abrir, contar,
  // fechar, justificar (CX-1, por conta)
  cashControl: boolean
  // Só na conta Caixa com controle: o dia se fecha contando às cegas (o
  // operador informa sem ver o esperado). Desligado é a conferência simples
  blindCount: boolean
  // Tolerância da quebra, em centavos. Nula por padrão: toda diferença vira
  // quebra. Com tolerância, a diferença dentro dela aparece, mas não é
  // lançada (4.1, 30/09/2026)
  shortageTolerance: number | null
  isActive: boolean
  // Com histórico, "excluir" inativa (CX-2)
  hasHistory: boolean
  openingBalance: number
  openingDate: string
  balance: number
  rules: MethodRule[]
}

export type MovementKind =
  | 'INCOME'
  | 'EXPENSE'
  | 'ADJUSTMENT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'SHORTAGE'
  | 'OVERAGE'
  | 'REVERSAL'

export const movementKindLabel: Record<MovementKind, string> = {
  INCOME: 'Recebimento',
  EXPENSE: 'Pagamento',
  ADJUSTMENT: 'Ajuste',
  TRANSFER_IN: 'Transferência recebida',
  TRANSFER_OUT: 'Transferência enviada',
  SHORTAGE: 'Quebra de caixa · falta',
  OVERAGE: 'Quebra de caixa · sobra',
  REVERSAL: 'Estorno',
}

export type Movement = {
  id: string
  kind: MovementKind
  description: string
  // Com sinal: positivo entra, negativo sai
  amount: number
  method: string
  // A data em que o fato aconteceu. Quando é de um dia já fechado, o
  // lançamento entra no caixa aberto como retroativo (CX-3)
  operationDate: string
  // Provisionado: previsto, ainda não compensado
  settled: boolean
  retroactive: boolean
  reason?: string
  // Plano de contas: obrigatório em todo lançamento (CX-5, 26/09/2026)
  category?: string
  responsible: string
  // Transferência e estorno andam em par (CX-2)
  linkedId?: string
  // O dinheiro que vem do fechamento da frente de caixa chega pendente: uma
  // pessoa responsável pelo caixa principal confere e aprova (4.2). Fica o
  // registro dos dois lados
  awaitingApproval?: boolean
  approvedBy?: string
}

export type CashDayStatus = 'OPEN' | 'CLOSED'

// O caixa é uma conta em um dia (CX-1 do levantamento)
export type CashDay = {
  id: string
  number: number
  accountId: string
  date: string
  status: CashDayStatus
  opening: number
  openedBy: string
  openedAt: string
  closedBy?: string
  closedAt?: string
  // Caixa físico: o que o operador contou. Banco: o saldo do extrato
  informed?: number
  note?: string
  reopenings: { at: string; by: string; reason: string }[]
  // Aberto e sem nenhum lançamento (o caixa que o cadastro da empresa abre):
  // não trava o dia seguinte, vira o caixa dele
  untouched?: boolean
  movements: Movement[]
}

const sum = (list: Movement[]) =>
  list.reduce((total, item) => total + item.amount, 0)

export const cashDayTotals = (day: CashDay) => {
  // Só o compensado mexe no saldo; o provisionado é previsão e fica à parte
  const settled = day.movements.filter((item) => item.settled)
  const current = settled.filter((item) => !item.retroactive)
  const retro = settled.filter((item) => item.retroactive)

  const entries = current
    .filter((item) => item.amount > 0)
    .reduce((t, i) => t + i.amount, 0)
  const exits = current
    .filter((item) => item.amount < 0)
    .reduce((t, i) => t - i.amount, 0)
  const retroactive = sum(retro)

  return {
    entries,
    exits,
    retroactive,
    // O saldo é sempre calculado (CX-2)
    balance: day.opening + entries - exits + retroactive,
    pending: day.movements
      .filter((item) => !item.settled)
      .reduce((t, i) => t + i.amount, 0),
  }
}

// A diferença da contagem no fechamento: o informado contra o que o sistema
// esperava antes de lançar a quebra. Com tolerância, a quebra pode não ter
// sido lançada, e a diferença continua visível (4.1)
export const countDifference = (day: CashDay) => {
  if (day.informed === undefined) return null
  const quebra = day.movements
    .filter((item) => item.kind === 'SHORTAGE' || item.kind === 'OVERAGE')
    .reduce((sum, item) => sum + item.amount, 0)
  return {
    expected: cashDayTotals(day).balance - quebra,
    difference: day.informed - (cashDayTotals(day).balance - quebra),
    // Lançada como quebra, ou só registrada (dentro da tolerância)
    posted: quebra !== 0,
  }
}
