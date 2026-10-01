'use server'

// PROVISÓRIO: a API ainda não tem os endpoints da frente de caixa (FC-1 a
// FC-20). Dados de exemplo em memória, no formato das actions reais, para a
// tela poder ser conferida antes de o backend existir.

// Types
import type {
  CashSession,
  PaymentPart,
  PendingSale,
  CashMovement,
  QuickSaleCheckout,
} from '@/app/(app-sidebar)/financeiro/frente-de-caixa/types'

const hoje = (hora: string) =>
  `${new Date().toISOString().slice(0, 10)}T${hora}`

// O cadastro da frente de caixa (3.1): modo de conferência, tolerância da
// quebra e limite do arredondamento. Padrões do documento: conferência
// simples, sem tolerância, R$ 1,00 de arredondamento
const register = {
  blindCount: false,
  shortageTolerance: null as number | null,
  roundingLimit: 100,
}

let session: CashSession | null = {
  id: 'c1',
  number: 13,
  name: 'Caixa 1',
  operator: 'Renata Alves',
  openedAt: hoje('08:12:00'),
  openingBalance: 20000,
  status: 'OPEN',
  ...register,
  movements: [
    {
      id: 'm1',
      kind: 'SALE',
      description: 'VR-2026-0311 · Consumidor · 2 cópias autenticadas',
      createdAt: hoje('08:47:00'),
      parts: [{ method: 'CASH', amount: 1200 }],
    },
    {
      id: 'm2',
      kind: 'SALE',
      description: 'VR-2026-0312 · Consumidor · Banner 1,00 × 0,50 m',
      createdAt: hoje('09:30:00'),
      parts: [{ method: 'CARD', amount: 8500 }],
    },
    {
      id: 'm3',
      kind: 'SUPPLY',
      description: 'Troco para o dia',
      reason: 'Reforço de troco, notas pequenas',
      responsible: 'Renata Alves',
      account: 'Caixa Empresa',
      createdAt: hoje('10:05:00'),
      parts: [{ method: 'CASH', amount: 10000 }],
    },
    {
      id: 'm4',
      kind: 'SALE',
      description: 'VR-2026-0315 · Consumidor · 500 cartões de visita',
      createdAt: hoje('11:18:00'),
      parts: [
        { method: 'PIX', amount: 10000 },
        { method: 'CASH', amount: 5000 },
      ],
    },
    {
      id: 'm5',
      kind: 'WITHDRAWAL',
      description: 'Sangria',
      reason: 'Acima do limite de dinheiro em gaveta',
      responsible: 'Renata Alves',
      account: 'Caixa Empresa',
      createdAt: hoje('14:00:00'),
      parts: [{ method: 'CASH', amount: 15000 }],
    },
  ],
}

let sales: PendingSale[] = [
  {
    id: 's1',
    reference: 'VR-2026-0318',
    client: 'Consumidor',
    seller: 'Tiago Nunes',
    kind: 'QUICK',
    total: 4500,
    paid: 0,
    delivered: false,
    approvedAt: hoje('15:02:00'),
    goesToCash: true,
  },
  {
    id: 's2',
    reference: 'VR-2026-0319',
    client: 'Marcelo Dias',
    seller: 'Tiago Nunes',
    kind: 'QUICK',
    // Sinal de 50% pago; o restante é cobrado na retirada (FC-17)
    total: 68000,
    paid: 34000,
    delivered: false,
    approvedAt: hoje('15:40:00'),
    goesToCash: true,
    // Outro caixa já puxou esta venda para atender (FC-5)
    claimedBy: 'Caixa 2 · Paulo Mendes',
  },
  {
    // Chegou como venda rápida e o caixa faturou para o cliente (FC-4): saiu
    // da fila e foi para o fluxo financeiro. Fica como registro do que o
    // caixa fez, até o fechamento. O orçamento que já nasce faturado
    // (faturamento mensal, boleto) não passa pela frente de caixa e não
    // aparece aqui (decidido em 01/10/2026)
    id: 's3',
    reference: 'VR-2026-0316',
    client: 'Supermercado Bom Preço',
    seller: 'Ana Prado',
    kind: 'QUICK',
    total: 32000,
    paid: 0,
    delivered: false,
    approvedAt: hoje('16:10:00'),
    goesToCash: false,
    billing: 'Faturamento mensal',
  },
]

// Trabalhos prontos e não retirados (FC-19): a mesma venda, marcada como
// pronta. Saem da fila "A receber" e entram em "Aguardando retirada"
sales.push(
  {
    id: 'p1',
    reference: 'VR-2026-0244',
    client: 'Juliana Prado',
    phone: '(48) 99911-4420',
    seller: 'Tiago Nunes',
    kind: 'QUICK',
    total: 24000,
    paid: 12000,
    delivered: false,
    approvedAt: '2026-09-01T10:20:00',
    goesToCash: true,
    ready: true,
    readyAt: '2026-09-09T16:00:00',
  },
  {
    id: 'p2',
    reference: 'VR-2026-0198',
    client: 'Oficina do Léo',
    phone: '(48) 98812-7701',
    seller: 'Ana Prado',
    kind: 'QUICK',
    total: 90000,
    paid: 45000,
    delivered: false,
    approvedAt: '2026-08-12T09:00:00',
    goesToCash: true,
    ready: true,
    readyAt: '2026-08-21T11:30:00',
  },
)

// A venda rápida do ponto de vista do orçamento, por id do orçamento
const checkouts: Record<string, QuickSaleCheckout> = {}

// Quantas frentes de caixa estão abertas agora. Com uma só, não há o que
// reservar: "Atender esta venda" e a marca de quem atende nem aparecem (FC-5)
const openCashFronts = 2

export const getCashFront = async () => ({
  success: true,
  data: { session, sales, openCashFronts },
  message: '',
})

export const openCashSession = async (openingBalance: number) => {
  session = {
    id: `c${Date.now()}`,
    number: (session?.number ?? 12) + 1,
    name: 'Caixa 1',
    operator: 'Renata Alves',
    openedAt: new Date().toISOString(),
    openingBalance,
    status: 'OPEN',
    ...register,
    movements: [],
  }

  return { success: true, data: session, message: '' }
}

const push = (movement: Omit<CashMovement, 'id' | 'createdAt'>) => {
  if (!session) return false

  session.movements.push({
    ...movement,
    id: `m${Date.now()}`,
    createdAt: new Date().toISOString(),
  })

  return true
}

export const addCashMovement = async (
  kind: 'WITHDRAWAL' | 'SUPPLY',
  amount: number,
  reason: string,
  // De onde o suprimento vem, ou para onde a sangria vai (uma conta da
  // empresa). Não é receita nem despesa: é dinheiro mudando de lugar
  account = 'Caixa Empresa',
) => {
  if (!session) {
    return { success: false, data: null, message: 'Nenhum caixa aberto' }
  }

  if (!reason.trim()) {
    return {
      success: false,
      data: null,
      message:
        'Informe o motivo: sangria e suprimento registram motivo e responsável',
    }
  }
  if (amount <= 0) {
    return { success: false, data: null, message: 'Informe o valor' }
  }

  push({
    kind,
    description:
      kind === 'WITHDRAWAL'
        ? `Sangria → ${account}`
        : `Suprimento ← ${account}`,
    reason,
    responsible: session.operator,
    account,
    parts: [{ method: 'CASH', amount }],
  })

  return { success: true, data: session, message: '' }
}

// Receber a venda: o pagamento pode vir dividido em várias formas (FC-9), e a
// entrega é um gesto à parte porque no sinal o cliente paga e leva depois
export const receiveSale = async (
  saleId: string,
  parts: PaymentPart[],
  deliver: boolean,
  // Arredondamento no balcão (FC-18): até o limite do cadastro, a diferença
  // vira desconto na venda, registrado na hora, e não quebra de caixa
  discount = 0,
) => {
  const sale = sales.find((item) => item.id === saleId)

  if (!sale) {
    return { success: false, data: null, message: 'Venda não encontrada' }
  }

  if (!session || session.status !== 'OPEN') {
    return {
      success: false,
      data: null,
      message: 'Abra o caixa antes de receber',
    }
  }

  // Com mais de um caixa, só recebe quem puxou a venda (FC-5)
  const me = `${session.name} · ${session.operator}`
  if (sale.claimedBy && sale.claimedBy !== me) {
    return {
      success: false,
      data: null,
      message: `Esta venda está sendo atendida no ${sale.claimedBy}`,
    }
  }
  sale.claimedBy = me

  const amount = parts.reduce((total, part) => total + part.amount, 0)

  if (discount > 0) {
    if (discount > session.roundingLimit) {
      return {
        success: false,
        data: null,
        message: `O arredondamento no balcão vai até ${(session.roundingLimit / 100).toFixed(2).replace('.', ',')}. Acima disso, vale o limite de desconto do perfil do vendedor`,
      }
    }
    sale.total -= discount
  }

  push({
    kind: 'SALE',
    description: `${sale.reference} · ${sale.client}`,
    discount: discount || undefined,
    parts,
  })

  sale.paid += amount
  sale.delivered = deliver || sale.delivered

  const checkout = sale.quotationId && checkouts[sale.quotationId]
  if (checkout) {
    checkout.paid = sale.paid
    checkout.delivered = sale.delivered
    checkout.parts = [...checkout.parts, ...parts]
  }

  // Venda paga e entregue sai da fila
  if (sale.paid >= sale.total && sale.delivered) {
    sales = sales.filter((item) => item.id !== saleId)
  }

  return { success: true, data: sale, message: '' }
}

// O estorno acontece pelo cancelamento da venda, com justificativa (FC-13)
export const reverseSale = async (saleId: string, reason: string) => {
  const sale = sales.find((item) => item.id === saleId)

  if (!sale || !session) {
    return { success: false, data: null, message: 'Venda não encontrada' }
  }

  if (!reason.trim()) {
    return {
      success: false,
      data: null,
      message: 'O estorno exige justificativa',
    }
  }

  push({
    kind: 'REVERSAL',
    description: `Cancelamento de ${sale.reference}`,
    reason,
    responsible: session.operator,
    parts: [{ method: 'CASH', amount: sale.paid }],
  })

  sales = sales.filter((item) => item.id !== saleId)

  const checkout = sale.quotationId && checkouts[sale.quotationId]
  if (checkout) checkout.cancelled = true

  return { success: true, data: null, message: '' }
}

// Fechamento (FC-7, 4.2): a diferença entre o esperado e o contado vai para
// "Quebra de caixa" no nome de quem operava, salvo dentro da tolerância, se
// houver. O dinheiro contado, menos o que fica na gaveta para amanhã, vai
// para a conta Caixa pendente de aprovação; PIX para o banco; cartão para a
// operadora, pelo valor cheio — um movimento por forma, não por venda
export const closeCashSession = async (countedCash: number, keep = 0) => {
  if (!session) {
    return { success: false, data: null, message: 'Nenhum caixa aberto' }
  }
  if (keep < 0 || keep > countedCash) {
    return {
      success: false,
      data: null,
      message: 'O valor que fica na gaveta não pode passar do contado',
    }
  }

  const movements = session.movements
  const expected = movements.reduce(
    (total, movement) =>
      total +
      movement.parts
        .filter((part) => part.method === 'CASH')
        .reduce((sum, part) => sum + part.amount, 0) *
        (movement.kind === 'WITHDRAWAL' || movement.kind === 'REVERSAL'
          ? -1
          : 1),
    session.openingBalance,
  )
  const difference = countedCash - expected
  const tolerance = session.shortageTolerance
  const posted =
    difference !== 0 && (tolerance === null || Math.abs(difference) > tolerance)

  const byMethod = (method: 'PIX' | 'CARD') =>
    movements
      .filter((movement) => movement.kind !== 'WITHDRAWAL')
      .reduce(
        (total, movement) =>
          total +
          movement.parts
            .filter((part) => part.method === method)
            .reduce((sum, part) => sum + part.amount, 0) *
            (movement.kind === 'REVERSAL' ? -1 : 1),
        0,
      )

  const transfers = [
    {
      method: 'CASH' as const,
      amount: countedCash - keep,
      destination: 'Caixa Empresa',
      pending: true,
    },
    {
      method: 'PIX' as const,
      amount: byMethod('PIX'),
      destination: 'Bradesco',
    },
    {
      method: 'CARD' as const,
      amount: byMethod('CARD'),
      destination: 'Rede (cartões)',
    },
  ].filter((transfer) => transfer.amount > 0)

  // As vendas do dia que foram para o fluxo financeiro são registro deste
  // caixa: saem com o fechamento e ficam no relatório do dia, separadas do
  // que passou pelo caixa (3.2). Amanhã a frente de caixa abre limpa
  const billed = sales.filter((sale) => !sale.goesToCash)
  sales = sales.filter((sale) => sale.goesToCash)

  session.status = 'CLOSED'

  return {
    success: true,
    data: {
      countedCash,
      expected,
      difference,
      posted,
      keep,
      transfers,
      billed: billed.map((sale) => ({
        reference: sale.reference,
        client: sale.client,
        total: sale.total,
        billing: sale.billing || 'Faturamento mensal',
      })),
    },
    message: '',
  }
}

// Trabalho pronto, cliente não buscou (FC-19): a venda sai de "A receber" e
// passa para "Aguardando retirada". Com o gerenciador de produção, é a
// conclusão da ordem que marca; sem ele, o caixa ou o vendedor marca aqui
export const markSaleReady = async (saleId: string) => {
  const sale = sales.find((item) => item.id === saleId)
  if (!sale) {
    return { success: false, data: null, message: 'Venda não encontrada' }
  }
  if (sale.delivered) {
    return { success: false, data: null, message: 'A venda já foi entregue' }
  }
  sale.ready = true
  sale.readyAt = new Date().toISOString()
  return { success: true, data: sale, message: '' }
}

// Dar baixa no trabalho não retirado (FC-19): "Descartar" encerra a venda e
// lança como perda o que não foi pago, com o sinal recebido abatendo. Pede
// justificativa e fica registrado (quem e quando)
export const discardPickup = async (saleId: string, reason: string) => {
  const sale = sales.find((item) => item.id === saleId && item.ready)
  if (!sale) {
    return { success: false, data: null, message: 'Trabalho não encontrado' }
  }
  if (!reason.trim()) {
    return {
      success: false,
      data: null,
      message: 'Descartar exige justificativa',
    }
  }
  sales = sales.filter((item) => item.id !== saleId)
  const checkout = sale.quotationId && checkouts[sale.quotationId]
  if (checkout) checkout.cancelled = true
  return {
    success: true,
    data: {
      loss: Math.max(0, sale.total - sale.paid),
      discardedBy: session?.operator || 'Operador',
      discardedAt: new Date().toISOString(),
    },
    message: '',
  }
}

export const getQuickSaleCheckout = async (quotationId: string) => ({
  success: true,
  data: checkouts[quotationId] ?? null,
  message: '',
})

type QuickSaleOrigin = {
  quotationId: string
  reference: string
  client: string
  seller: string
  total: number
}

// Enviar a venda rápida ao caixa. Não é um gesto além da aprovação: aprovar
// a venda rápida já a coloca na fila (FC-12), e a partir daí ela trava (FC-11)
export const sendQuickSaleToCash = async (origin: QuickSaleOrigin) => {
  if (checkouts[origin.quotationId]) {
    return {
      success: false,
      data: null,
      message: 'Esta venda já foi enviada ao caixa',
    }
  }

  const approvedAt = new Date().toISOString()

  sales.push({
    id: `s${Date.now()}`,
    quotationId: origin.quotationId,
    reference: origin.reference,
    client: origin.client,
    seller: origin.seller,
    kind: 'QUICK',
    total: origin.total,
    paid: 0,
    delivered: false,
    approvedAt,
    goesToCash: true,
  })

  checkouts[origin.quotationId] = {
    quotationId: origin.quotationId,
    path: 'POS',
    sentAt: approvedAt,
    total: origin.total,
    paid: 0,
    delivered: false,
    cancelled: false,
    parts: [],
  }

  return { success: true, data: checkouts[origin.quotationId], message: '' }
}

// Cobrar na hora (VR-5): só à vista, pelo total, sem parcela e sem cobrança
// futura. A venda se encerra no atendimento e o dinheiro entra na conta
// Caixa Empresa, como qualquer baixa do START
export const chargeQuickSaleNow = async (
  origin: QuickSaleOrigin,
  parts: PaymentPart[],
  // Arredondamento no balcão (FC-18), como desconto na venda
  discount = 0,
) => {
  const paid = parts.reduce((total, part) => total + part.amount, 0)

  if (discount > register.roundingLimit) {
    return {
      success: false,
      data: null,
      message: 'Arredondamento acima do limite do balcão',
    }
  }

  if (paid + discount < origin.total) {
    return {
      success: false,
      data: null,
      message:
        'A venda rápida é cobrada pelo total. Para parcelar ou cobrar depois, use um orçamento comum',
    }
  }

  checkouts[origin.quotationId] = {
    quotationId: origin.quotationId,
    path: 'CASH_ONLY',
    sentAt: new Date().toISOString(),
    total: origin.total - discount,
    paid,
    delivered: true,
    cancelled: false,
    parts,
  }

  return { success: true, data: checkouts[origin.quotationId], message: '' }
}

// Com mais de um caixa, cada um puxa para si a venda que vai atender (FC-5)
export const claimSale = async (saleId: string) => {
  const sale = sales.find((item) => item.id === saleId)
  if (!sale || !session) {
    return { success: false, data: null, message: 'Venda não encontrada' }
  }

  const me = `${session.name} · ${session.operator}`
  if (sale.claimedBy && sale.claimedBy !== me) {
    return {
      success: false,
      data: null,
      message: `Esta venda já está com o ${sale.claimedBy}`,
    }
  }

  sale.claimedBy = me
  return { success: true, data: sale, message: '' }
}

export const releaseSale = async (saleId: string) => {
  const sale = sales.find((item) => item.id === saleId)
  if (sale && sale.paid === 0) sale.claimedBy = null
  return { success: true, data: null, message: '' }
}

// Reverter a venda rápida para faturamento (FC-4): o cliente que paga no fim
// do mês. A venda sai da fila do caixa e vai para o fluxo financeiro, no
// nome do cliente e com a forma de pagamento dele
export const reverseToBilling = async (
  saleId: string,
  values: {
    client: { id: string; name: string }
    paymentConditionId: string
    installmentQty: number
    dueDate: string
    notes?: string
  },
) => {
  const sale = sales.find((item) => item.id === saleId)
  if (!sale) {
    return { success: false, data: null, message: 'Venda não encontrada' }
  }
  if (!values.client.id) {
    return { success: false, data: null, message: 'Escolha o cliente' }
  }
  if (!values.paymentConditionId || !values.dueDate) {
    return {
      success: false,
      data: null,
      message: 'Informe a forma de pagamento e o vencimento',
    }
  }
  if (sale.paid > 0) {
    return {
      success: false,
      data: null,
      message:
        'A venda já tem sinal recebido. Estorne o sinal antes de faturar para o cliente',
    }
  }
  // Na API: só cliente com cadastro aprovado e liberado para a forma
  // escolhida (boleto, faturamento) pode ser faturado (FC-4)

  const dueDate = new Date(values.dueDate).toLocaleDateString('pt-BR')
  sale.client = values.client.name
  sale.billing =
    values.installmentQty > 1
      ? `${values.installmentQty}x · 1º vencimento ${dueDate}`
      : `Vencimento ${dueDate}`
  sale.goesToCash = false
  sale.claimedBy = null
  return { success: true, data: sale, message: '' }
}
