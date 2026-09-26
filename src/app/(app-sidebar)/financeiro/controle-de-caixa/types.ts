// Contas bancárias e controle de caixa — regras CX-0 a CX-5, em
// openspec/regras-de-negocio/areas/12-recursos-do-lite.md, com base no
// levantamento do legado (legado-controle-de-caixa.md).
//
// O princípio (CX-0): controle é habilitável. O que o sistema faz sozinho vale
// para todas as contas; o que exige disciplina ou pode travar uma baixa vale
// só nas contas com controle ligado.

// O tipo da conta decide como o dia se fecha (CX-3): a gaveta se conta, o
// banco se concilia com o extrato
export type AccountKind = 'CASH' | 'BANK'

export const accountKindLabel: Record<AccountKind, string> = {
  CASH: 'Caixa físico',
  BANK: 'Banco',
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

// Tolerância para a diferença da contagem, em centavos (FC-18, CX-3)
export const COUNT_TOLERANCE = 50
