'use server'

// PROVISÓRIO: dados de exemplo em memória para as telas de Contas bancárias e
// Controle de caixa (regras CX-0 a CX-5). A API já tem o cadastro de contas
// (`bankAccountRoute`, com as regras por condição de pagamento), mas não tem o
// tipo da conta, a conta padrão por forma, nem o caixa do dia com contagem,
// retroativo e reabertura. Ver openspec/analise/backend-pendente.md.

// Types
import {
  COUNT_TOLERANCE,
  cashDayTotals,
  type CashDay,
  type Movement,
  type MethodRule,
  type BankAccount,
} from '@/app/(app-sidebar)/financeiro/controle-de-caixa/types'

const OPERATOR = 'Renata Alves'

const day = (offset: number) => {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return date.toISOString().slice(0, 10)
}

const at = (offset: number, time: string) => `${day(offset)}T${time}`

const methods = [
  { id: 'din', name: 'Dinheiro' },
  { id: 'pix', name: 'PIX' },
  { id: 'deb', name: 'Cartão de débito' },
  { id: 'cre', name: 'Cartão de crédito' },
  { id: 'bol', name: 'Boleto' },
  { id: 'ted', name: 'Transferência (TED)' },
]

const rules = (
  accepted: Record<
    string,
    Partial<Omit<MethodRule, 'methodId' | 'methodName'>>
  >,
): MethodRule[] =>
  methods.map((method) => ({
    methodId: method.id,
    methodName: method.name,
    acceptIncomes: false,
    incomeType: 'PAYSOFF',
    acceptPayments: false,
    paymentType: 'PAYSOFF',
    isDefault: false,
    ...accepted[method.id],
  }))

let accounts: BankAccount[] = [
  {
    id: 'a1',
    name: 'Caixa Empresa',
    kind: 'CASH',
    bankName: 'Empresa',
    bankCode: '000',
    bankIcon: 'company',
    cashControl: true,
    isActive: true,
    hasHistory: true,
    openingBalance: 20000,
    openingDate: day(-30),
    balance: 0,
    rules: rules({
      din: {
        acceptIncomes: true,
        acceptPayments: true,
        isDefault: true,
      },
    }),
  },
  {
    id: 'a2',
    name: 'Bradesco',
    kind: 'BANK',
    bankName: 'Banco Bradesco',
    bankCode: '237',
    bankIcon: 'bancoBradesco',
    cashControl: true,
    isActive: true,
    hasHistory: true,
    openingBalance: 150000,
    openingDate: day(-30),
    balance: 0,
    rules: rules({
      pix: { acceptIncomes: true, acceptPayments: true, isDefault: true },
      deb: {
        acceptIncomes: true,
        incomeType: 'PROVISION',
        isDefault: true,
      },
      cre: {
        acceptIncomes: true,
        incomeType: 'PROVISION',
        isDefault: true,
      },
      bol: {
        acceptIncomes: true,
        incomeType: 'PROVISION',
        acceptPayments: true,
        isDefault: true,
      },
      ted: { acceptIncomes: true, acceptPayments: true, isDefault: true },
    }),
  },
  {
    // Conta livre: sem controle, só o saldo (CX-0)
    id: 'a3',
    name: 'Inter',
    kind: 'BANK',
    bankName: 'Banco Inter',
    bankCode: '077',
    bankIcon: '',
    cashControl: false,
    isActive: true,
    hasHistory: true,
    openingBalance: 0,
    openingDate: day(-30),
    balance: 48750,
    rules: rules({
      pix: { acceptIncomes: true, acceptPayments: true },
    }),
  },
  {
    id: 'a4',
    name: 'Itaú (antiga)',
    kind: 'BANK',
    bankName: 'Itaú Unibanco',
    bankCode: '341',
    bankIcon: 'bancoItau',
    cashControl: false,
    isActive: false,
    hasHistory: true,
    openingBalance: 0,
    openingDate: day(-400),
    balance: 0,
    rules: rules({}),
  },
]

const mv = (
  movement: Partial<Movement> & Pick<Movement, 'kind' | 'description'>,
): Movement => ({
  id: `m${Math.random().toString(36).slice(2, 9)}`,
  amount: 0,
  method: 'Dinheiro',
  operationDate: day(0),
  settled: true,
  retroactive: false,
  responsible: OPERATOR,
  ...movement,
})

const days: CashDay[] = [
  // Caixa Empresa — anteontem, fechado com falta de R$ 3,00 (quebra de caixa)
  {
    id: 'd1',
    number: 21,
    accountId: 'a1',
    date: day(-2),
    status: 'CLOSED',
    opening: 20000,
    openedBy: OPERATOR,
    openedAt: at(-2, '08:05:00'),
    closedBy: OPERATOR,
    closedAt: at(-2, '18:40:00'),
    informed: 64700,
    note: 'Faltaram R$ 3,00 — troco dado a mais',
    reopenings: [],
    movements: [
      mv({
        kind: 'INCOME',
        description: 'Fechamento FC nº 11 · dinheiro',
        amount: 52000,
        operationDate: day(-2),
      }),
      mv({
        kind: 'EXPENSE',
        description: 'Compra de café e água',
        amount: -7000,
        operationDate: day(-2),
      }),
      mv({
        kind: 'SHORTAGE',
        description: 'Diferença da contagem',
        amount: -300,
        operationDate: day(-2),
        reason: 'Faltaram R$ 3,00 — troco dado a mais',
      }),
    ],
  },
  // Caixa Empresa — ontem, esquecido aberto: é ele que trava o dia de hoje
  // (FC-14)
  {
    id: 'd2',
    number: 22,
    accountId: 'a1',
    date: day(-1),
    status: 'OPEN',
    opening: 64700,
    openedBy: OPERATOR,
    openedAt: at(-1, '08:02:00'),
    reopenings: [],
    movements: [
      mv({
        kind: 'INCOME',
        description: 'Fechamento FC nº 12 · dinheiro',
        amount: 85000,
        operationDate: day(-1),
      }),
      mv({
        kind: 'TRANSFER_OUT',
        description: 'Depósito no Bradesco',
        amount: -50000,
        operationDate: day(-1),
        linkedId: 't1',
      }),
    ],
  },
  // Bradesco — ontem, fechado pela conciliação com o extrato
  {
    id: 'd3',
    number: 40,
    accountId: 'a2',
    date: day(-1),
    status: 'CLOSED',
    opening: 150000,
    openedBy: 'Maicol Souza',
    openedAt: at(-1, '09:00:00'),
    closedBy: 'Maicol Souza',
    closedAt: at(-1, '17:55:00'),
    informed: 238000,
    reopenings: [],
    movements: [
      mv({
        kind: 'INCOME',
        description: 'Supermercado Bom Preço · ORC-2026-0184 (1/3)',
        amount: 38000,
        method: 'Boleto',
        operationDate: day(-1),
      }),
      mv({
        kind: 'TRANSFER_IN',
        description: 'Depósito vindo do Caixa Empresa',
        amount: 50000,
        method: 'Dinheiro',
        operationDate: day(-1),
        linkedId: 't1',
      }),
    ],
  },
  // Bradesco — hoje, aberto; com um lançamento retroativo e recebimentos de
  // cartão ainda provisionados
  {
    id: 'd4',
    number: 41,
    accountId: 'a2',
    date: day(0),
    status: 'OPEN',
    opening: 238000,
    openedBy: 'Maicol Souza',
    openedAt: at(0, '08:30:00'),
    reopenings: [],
    movements: [
      mv({
        kind: 'INCOME',
        description: 'VR-2026-0315 · Consumidor · 500 cartões de visita',
        amount: 10000,
        method: 'PIX',
      }),
      mv({
        kind: 'INCOME',
        description: 'VR-2026-0312 · Consumidor · banner',
        amount: 8500,
        method: 'Cartão de débito',
        // Previsão pelo valor cheio; a taxa é confirmada na baixa (FC-10)
        settled: false,
      }),
      mv({
        kind: 'EXPENSE',
        description: 'Tarifa bancária de ontem, lançada hoje',
        amount: -1290,
        method: 'Débito em conta',
        operationDate: day(-1),
        // O dia de ontem está fechado: entra aqui, marcado (CX-3)
        retroactive: true,
        responsible: 'Maicol Souza',
      }),
    ],
  },
]

// Logos que o sistema já tem, pelo código do banco
const iconByCode: Record<string, string> = {
  '000': 'company',
  '001': 'bancoDoBrasil',
  '033': 'bancoSantanderBrasil',
  '104': 'caixaEconomicaFederal',
  '237': 'bancoBradesco',
  '341': 'bancoItau',
}

const balanceOf = (account: BankAccount) => {
  if (!account.cashControl) return account.balance

  const last = days
    .filter((item) => item.accountId === account.id)
    .sort((a, b) => b.date.localeCompare(a.date))[0]

  return last ? cashDayTotals(last).balance : account.openingBalance
}

const withBalance = (list: BankAccount[]) =>
  list.map((account) => ({ ...account, balance: balanceOf(account) }))

const fail = (message: string) => ({ success: false, data: null, message })
const ok = <T>(data: T) => ({ success: true, data, message: '' })

/* ---------------------------------------------------------------------------
 * Contas
 * ------------------------------------------------------------------------- */

export const getBankAccounts = async () => ok(withBalance(accounts))

export const getPaymentMethods = async () => ok(methods)

export const saveBankAccount = async (
  input: Omit<
    BankAccount,
    'id' | 'balance' | 'hasHistory' | 'isActive' | 'bankIcon'
  > & {
    id?: string
  },
) => {
  if (!input.name.trim()) return fail('Dê um nome para a conta')

  const values = {
    ...input,
    bankIcon: iconByCode[input.kind === 'CASH' ? '000' : input.bankCode] || '',
  }

  // A conta padrão de cada forma é uma só: marcar esta desmarca as outras
  const defaults = values.rules
    .filter((rule) => rule.isDefault && rule.acceptIncomes)
    .map((rule) => rule.methodId)

  accounts = accounts.map((account) =>
    account.id === values.id
      ? account
      : {
          ...account,
          rules: account.rules.map((rule) =>
            defaults.includes(rule.methodId)
              ? { ...rule, isDefault: false }
              : rule,
          ),
        },
  )

  if (values.id) {
    accounts = accounts.map((account) =>
      account.id === values.id ? { ...account, ...values } : account,
    )
  } else {
    accounts.push({
      ...values,
      id: `a${Date.now()}`,
      isActive: true,
      hasHistory: false,
      balance: values.openingBalance,
    })
  }

  return ok(null)
}

// "Excluir" é um botão só; o sistema decide (CX-2). Com histórico, inativa —
// e só com saldo zero e sem caixa aberto
export const removeBankAccount = async (id: string) => {
  const account = accounts.find((item) => item.id === id)

  if (!account) return fail('Conta não encontrada')

  if (!account.hasHistory) {
    accounts = accounts.filter((item) => item.id !== id)
    return ok({ removed: 'DELETED' as const })
  }

  if (balanceOf(account) !== 0) {
    return fail(
      'A conta tem saldo. Transfira o saldo para outra conta antes de inativar',
    )
  }

  if (days.some((item) => item.accountId === id && item.status === 'OPEN')) {
    return fail('Feche o caixa desta conta antes de inativar')
  }

  account.isActive = false
  return ok({ removed: 'INACTIVATED' as const })
}

export const reactivateBankAccount = async (id: string) => {
  accounts = accounts.map((account) =>
    account.id === id ? { ...account, isActive: true } : account,
  )
  return ok(null)
}

/* ---------------------------------------------------------------------------
 * Caixa do dia
 * ------------------------------------------------------------------------- */

export const getCashControl = async () =>
  ok({
    accounts: withBalance(accounts).filter((account) => account.isActive),
    days: [...days].sort(
      (a, b) =>
        b.date.localeCompare(a.date) || a.accountId.localeCompare(b.accountId),
    ),
    today: day(0),
  })

const openDayOf = (accountId: string, date?: string) =>
  days.find(
    (item) =>
      item.accountId === accountId &&
      item.status === 'OPEN' &&
      (!date || item.date === date),
  )

export const openCashDay = async (accountId: string, date: string) => {
  const account = accounts.find((item) => item.id === accountId)

  if (!account) return fail('Conta não encontrada')
  if (!account.cashControl) {
    return fail('Esta conta está sem controle de caixa: não tem abertura')
  }
  if (days.some((item) => item.accountId === accountId && item.date === date)) {
    return fail('Esta conta já tem caixa nesse dia')
  }

  // Não se abre um dia depois de outro que ficou aberto (FC-14). O bloqueio
  // é por conta: um caixa esquecido não trava as outras
  const stuck = days.find(
    (item) =>
      item.accountId === accountId &&
      item.status === 'OPEN' &&
      item.date < date,
  )
  if (stuck) {
    return fail(
      `O caixa de ${stuck.date.split('-').reverse().join('/')} desta conta ainda está aberto. Feche-o antes de abrir outro dia`,
    )
  }

  const previous = days
    .filter((item) => item.accountId === accountId && item.date < date)
    .sort((a, b) => b.date.localeCompare(a.date))[0]

  days.push({
    id: `d${Date.now()}`,
    number: Math.max(...days.map((item) => item.number)) + 1,
    accountId,
    date,
    status: 'OPEN',
    // A abertura é o saldo do caixa anterior da mesma conta
    opening: previous
      ? cashDayTotals(previous).balance
      : account.openingBalance,
    openedBy: OPERATOR,
    openedAt: new Date().toISOString(),
    reopenings: [],
    movements: [],
  })

  return ok(null)
}

export const addAdjustment = async (
  dayId: string,
  amount: number,
  reason: string,
  category: string,
) => {
  const target = days.find((item) => item.id === dayId)

  if (!target || target.status !== 'OPEN') {
    return fail('Este caixa está fechado e não permite lançamento')
  }
  if (!amount) return fail('Informe o valor do ajuste')
  // No legado o ajuste não pedia motivo; aqui pede, como a sangria (CX-3)
  if (!reason.trim()) return fail('Informe o motivo do ajuste')
  // Informar o plano de contas é obrigatório (CX-5)
  if (!category) return fail('Informe o plano de contas do ajuste')

  target.movements.push(
    mv({
      kind: 'ADJUSTMENT',
      description: amount > 0 ? 'Ajuste de entrada' : 'Ajuste de saída',
      amount,
      reason,
      category,
    }),
  )

  return ok(null)
}

// Transferência é um par (CX-2): sai de uma, entra na outra, ligadas
export const transferBetweenAccounts = async (values: {
  fromId: string
  toId: string
  method: string
  amount: number
  date: string
}) => {
  const { fromId, toId, method, amount, date } = values

  if (!fromId || !toId) return fail('Escolha a origem e o destino')
  if (fromId === toId) return fail('Origem e destino precisam ser diferentes')
  if (amount <= 0) return fail('O valor precisa ser maior que zero')

  const from = accounts.find((item) => item.id === fromId)
  const to = accounts.find((item) => item.id === toId)
  if (!from || !to) return fail('Conta não encontrada')

  const fromDay = from.cashControl ? openDayOf(fromId, date) : undefined
  const toDay = to.cashControl ? openDayOf(toId, date) : undefined

  if (from.cashControl && !fromDay) {
    return fail(`Abra o caixa de ${from.name} nesse dia antes de transferir`)
  }
  if (to.cashControl && !toDay) {
    return fail(`Abra o caixa de ${to.name} nesse dia antes de transferir`)
  }

  const link = `t${Date.now()}`

  if (fromDay) {
    fromDay.movements.push(
      mv({
        kind: 'TRANSFER_OUT',
        description: `Transferência para ${to.name}`,
        amount: -amount,
        method,
        operationDate: date,
        linkedId: link,
      }),
    )
  } else from.balance -= amount

  if (toDay) {
    toDay.movements.push(
      mv({
        kind: 'TRANSFER_IN',
        description: `Transferência de ${from.name}`,
        amount,
        method,
        operationDate: date,
        linkedId: link,
      }),
    )
  } else to.balance += amount

  return ok(null)
}

// Fechamento de acordo com o tipo da conta (CX-3): a gaveta se conta às
// cegas; o banco se concilia com o extrato
export const closeCashDay = async (
  dayId: string,
  informed: number,
  note: string,
) => {
  const target = days.find((item) => item.id === dayId)
  const account = accounts.find((item) => item.id === target?.accountId)

  if (!target || !account) return fail('Caixa não encontrado')
  if (target.status === 'CLOSED') return fail('Este caixa já está fechado')

  const difference = informed - cashDayTotals(target).balance

  if (account.kind === 'BANK' && difference !== 0 && !note.trim()) {
    return fail('O extrato não bate com o sistema: explique a diferença')
  }

  // Na gaveta, a diferença vira "quebra de caixa" no nome de quem operava —
  // nunca um ajuste silencioso. Dentro da tolerância, os centavos também vão
  // para a quebra, sem pedir explicação
  if (account.kind === 'CASH' && difference !== 0) {
    if (Math.abs(difference) > COUNT_TOLERANCE && !note.trim()) {
      return fail('A contagem não bate: explique a diferença')
    }

    target.movements.push(
      mv({
        kind: difference < 0 ? 'SHORTAGE' : 'OVERAGE',
        description: 'Diferença da contagem',
        amount: difference,
        operationDate: target.date,
        reason: note || 'Dentro da tolerância',
      }),
    )
  }

  target.status = 'CLOSED'
  target.informed = informed
  target.note = note
  target.closedBy = OPERATOR
  target.closedAt = new Date().toISOString()

  return ok({ difference })
}

// Reabrir exige justificativa e anula a conferência daquele dia (ALT-7)
export const reopenCashDay = async (dayId: string, reason: string) => {
  const target = days.find((item) => item.id === dayId)

  if (!target || target.status !== 'CLOSED') {
    return fail('Só se reabre um caixa fechado')
  }
  if (!reason.trim()) return fail('Informe por que o caixa está sendo reaberto')

  // A quebra apurada na conferência sai: a contagem será refeita
  target.movements = target.movements.filter(
    (item) => item.kind !== 'SHORTAGE' && item.kind !== 'OVERAGE',
  )
  target.status = 'OPEN'
  target.informed = undefined
  target.reopenings.push({
    at: new Date().toISOString(),
    by: 'Maicol Souza',
    reason,
  })

  return ok(null)
}
