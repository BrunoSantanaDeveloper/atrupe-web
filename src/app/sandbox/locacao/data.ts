// Dados de exemplo e contas da vitrine da locação (área 14 do openspec,
// regras LC-1 a LC-15). Tudo em memória: nada aqui chama a API.

export type Plan = 'START' | 'LITE' | 'PRO' | 'ELITE'

export const PLANS: Plan[] = ['START', 'LITE', 'PRO', 'ELITE']

export const PLAN_NAME: Record<Plan, string> = {
  START: 'Start',
  LITE: 'Lite',
  PRO: 'Pro',
  ELITE: 'Elite',
}

export const planHas = (plan: Plan, from: Plan) =>
  PLANS.indexOf(plan) >= PLANS.indexOf(from)

// Revisão de 16/11/2026: a locação usa as regras que o sistema já tem. Não há
// modos nem regra de preço própria. O produto de locação é um produto comum
// com um período (dias) e um valor; do LITE em diante cada período é uma
// variação (PV-6), como P, M e G. A quantidade do item é a quantidade comum:
// 1 outdoor, 14 peças de box truss, 2 anúncios no painel de LED.
export interface RentalPeriod {
  id: string
  name: string
  days: number
  priceCents: number
}

export interface RentalSpot {
  address: string
  face: string
  lit: boolean
  artSize: string
}

export interface RentalProduct {
  id: string
  name: string
  // START: vale só o primeiro. LITE: são as variações do produto
  periods: RentalPeriod[]
  // Quantidade disponível para locar (LITE, com a reserva): 1 outdoor, 20
  // peças, 6 anúncios ao mesmo tempo
  capacity: number
  // Nome da unidade quando há mais de uma: [singular, plural]
  unit?: [string, string]
  // Tem ponto (endereço, face, arte): outdoor e painel
  spot?: RentalSpot
  // Gera tarefas de entrega e montagem, e não de veiculação (ELITE)
  event?: boolean
  // PRO: o patrimônio que entra na composição
  assetId?: string
}

export const PRODUCTS: RentalProduct[] = [
  {
    id: 'outdoor-brasil',
    name: 'Outdoor Av. Brasil, 1200',
    capacity: 1,
    periods: [
      { id: 'b', name: 'Bissemana', days: 14, priceCents: 84000 },
      { id: 'd', name: 'Diária', days: 1, priceCents: 9000 },
      { id: 'm', name: 'Mês', days: 30, priceCents: 150000 },
      { id: 't', name: 'Trimestre', days: 90, priceCents: 405000 },
    ],
    spot: {
      address: 'Av. Brasil, 1200 - Centro, Balneário Camboriú/SC',
      face: 'Sentido centro, lado direito',
      lit: true,
      artSize: '9,00 × 3,00 m',
    },
    assetId: 'asset-outdoor-brasil',
  },
  {
    id: 'outdoor-br101',
    name: 'Outdoor BR-101, km 132',
    capacity: 1,
    periods: [
      { id: 'b', name: 'Bissemana', days: 14, priceCents: 70000 },
      { id: 'm', name: 'Mês', days: 30, priceCents: 120000 },
    ],
    spot: {
      address: 'BR-101, km 132 - Itajaí/SC',
      face: 'Sentido sul',
      lit: false,
      artSize: '9,00 × 3,00 m',
    },
    assetId: 'asset-outdoor-br101',
  },
  {
    id: 'truss-2m',
    name: 'Box truss Q30 2 m',
    capacity: 20,
    unit: ['peça', 'peças'],
    event: true,
    periods: [
      { id: 'd', name: 'Diária', days: 1, priceCents: 2500 },
      { id: 'f', name: 'Fim de semana', days: 3, priceCents: 6000 },
      { id: 's', name: 'Semana', days: 7, priceCents: 10500 },
    ],
    assetId: 'asset-truss',
  },
  {
    id: 'led-centro',
    name: 'Anúncio no painel de LED Centro',
    capacity: 6,
    unit: ['anúncio', 'anúncios'],
    periods: [
      { id: 's', name: 'Semana', days: 7, priceCents: 35000 },
      { id: 'm', name: 'Mês', days: 30, priceCents: 120000 },
    ],
    spot: {
      address: 'Rua 1500, esquina com a 3ª Avenida - Centro',
      face: 'Cruzamento, duas faces',
      lit: true,
      artSize: '1920 × 1080 px, 15 s a cada 90 s',
    },
    assetId: 'asset-led',
  },
]

export const unitOf = (product: RentalProduct, count = 1) =>
  product.unit ? product.unit[count === 1 ? 0 : 1] : ''

// Os períodos que o plano enxerga: no START o produto tem um período só
export const periodsOf = (product: RentalProduct, plan: Plan) =>
  planHas(plan, 'LITE') ? product.periods : product.periods.slice(0, 1)

const DAY = 24 * 60 * 60 * 1000

export const atNoon = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12)

export const addDays = (date: Date, days: number) =>
  new Date(atNoon(date).getTime() + days * DAY)

// O dia de início e o de fim contam: de 01/12 a 14/12 são 14 dias
export const daysBetween = (start?: Date, end?: Date) => {
  if (!start || !end) return 0
  const diff = Math.round(
    (atNoon(end).getTime() - atNoon(start).getTime()) / DAY,
  )
  return diff >= 0 ? diff + 1 : 0
}

export const formatDate = (date?: Date) =>
  date ? date.toLocaleDateString('pt-BR') : '-'

export const formatBrl = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Cada linha do orçamento é um período: quem locou a bissemana paga o valor
// da bissemana e leva os 14 dias. O fim sai do início e dos dias do período.
// O valor é o preço do período vezes a quantidade, como em qualquer produto
export const periodOf = (product: RentalProduct, periodId?: string) =>
  product.periods.find((period) => period.id === periodId) || product.periods[0]

export const endOf = (start: Date | undefined, period: RentalPeriod) =>
  start ? addDays(start, period.days - 1) : undefined

// Reserva (LC-8 ajustada em 16/11): Digitação não reserva; Aguardando reserva
// até a proposta vencer; Aprovado confirma
export type QuotationStatus = 'DRAFT' | 'WAITING' | 'APPROVED' | 'EXPIRED'

export const STATUS_LABEL: Record<QuotationStatus, string> = {
  DRAFT: 'Digitação',
  WAITING: 'Aguardando',
  APPROVED: 'Aprovado',
  EXPIRED: 'Vencido',
}

export interface Reservation {
  id: string
  productId: string
  quotation: string
  client: string
  start: Date
  end: Date
  count: number
  status: QuotationStatus
  // Validade da proposta: até aqui o Aguardando segura a reserva
  validUntil?: Date
  monthlyCents?: number
}

const TODAY = atNoon(new Date())

export const today = () => TODAY

export const RESERVATIONS: Reservation[] = [
  {
    id: 'r1',
    productId: 'outdoor-brasil',
    quotation: '38-T1',
    client: 'Supermercado Bom Preço',
    start: addDays(TODAY, 5),
    end: addDays(TODAY, 18),
    count: 1,
    status: 'WAITING',
    validUntil: addDays(TODAY, 3),
  },
  {
    id: 'r2',
    productId: 'outdoor-br101',
    quotation: '31-T1',
    client: 'Construtora Horizonte',
    start: addDays(TODAY, -75),
    end: addDays(TODAY, 14),
    count: 1,
    status: 'APPROVED',
    monthlyCents: 120000,
  },
  {
    id: 'r3',
    productId: 'truss-2m',
    quotation: '36-T1',
    client: 'Feira do Empreendedor',
    start: addDays(TODAY, 8),
    end: addDays(TODAY, 11),
    count: 14,
    status: 'APPROVED',
  },
  {
    id: 'r4',
    productId: 'led-centro',
    quotation: '29-T1',
    client: 'Academia Corpo em Forma',
    start: addDays(TODAY, -20),
    end: addDays(TODAY, 40),
    count: 2,
    status: 'APPROVED',
    monthlyCents: 240000,
  },
  {
    id: 'r5',
    productId: 'led-centro',
    quotation: '33-T1',
    client: 'Pizzaria Forno a Lenha',
    start: addDays(TODAY, -5),
    end: addDays(TODAY, 24),
    count: 3,
    status: 'APPROVED',
    monthlyCents: 360000,
  },
]

export const holds = (reservation: Reservation) =>
  reservation.status === 'APPROVED' ||
  (reservation.status === 'WAITING' &&
    (!reservation.validUntil || reservation.validUntil >= TODAY))

export const overlaps = (reservation: Reservation, start?: Date, end?: Date) =>
  !!start &&
  !!end &&
  atNoon(reservation.start) <= atNoon(end) &&
  atNoon(reservation.end) >= atNoon(start)

export interface Availability {
  free: number
  conflicts: Reservation[]
}

// Bem individual: qualquer reserva no período bloqueia. Por quantidade e por
// anúncio: sobra o saldo do período (LC-6, LC-9)
export const availabilityOf = (
  product: RentalProduct,
  start?: Date,
  end?: Date,
  reservations: Reservation[] = RESERVATIONS,
): Availability => {
  const conflicts = reservations.filter(
    (reservation) =>
      reservation.productId === product.id &&
      holds(reservation) &&
      overlaps(reservation, start, end),
  )
  const taken = conflicts.reduce((sum, item) => sum + item.count, 0)
  return { free: Math.max(product.capacity - taken, 0), conflicts }
}

// PRO: os bens de locação são patrimônios, com os custos próprios (LC-2,
// LC-3) e a ocupação de referência no lugar da produtividade (LC-7)
export interface AssetCost {
  name: string
  monthlyCents: number
  account?: string
}

export interface RentalAsset {
  id: string
  name: string
  valueCents: number
  lifeYears: number
  residualPercent: number
  fixedCosts: AssetCost[]
  // Dias alugados por mês que o bem costuma ter (de 30)
  referenceDays: number
  // Ocupação realizada, em dias alugados por mês, dos últimos 12 meses
  occupancy: number[]
  // Receita por competência e custo realizado do mês corrente
  revenueCents: number
  realCostCents: number
}

export const ASSETS: RentalAsset[] = [
  {
    id: 'asset-outdoor-brasil',
    name: 'Outdoor Av. Brasil, 1200',
    valueCents: 1200000,
    lifeYears: 10,
    residualPercent: 10,
    fixedCosts: [
      {
        name: 'Aluguel do terreno',
        monthlyCents: 40000,
        account: 'Aluguel de pontos',
      },
      { name: 'Iluminação', monthlyCents: 8000, account: 'Energia elétrica' },
      { name: 'Manutenção e seguro', monthlyCents: 3000, account: 'Seguros' },
    ],
    referenceDays: 20,
    occupancy: [14, 14, 28, 20, 14, 28, 30, 14, 20, 28, 30, 22],
    revenueCents: 132000,
    realCostCents: 61500,
  },
  {
    id: 'asset-outdoor-br101',
    name: 'Outdoor BR-101, km 132',
    valueCents: 1000000,
    lifeYears: 10,
    residualPercent: 10,
    fixedCosts: [
      {
        name: 'Aluguel do terreno',
        monthlyCents: 55000,
        account: 'Aluguel de pontos',
      },
      { name: 'Manutenção e seguro', monthlyCents: 3000, account: 'Seguros' },
    ],
    referenceDays: 22,
    occupancy: [0, 14, 14, 0, 14, 28, 14, 0, 14, 30, 30, 30],
    revenueCents: 120000,
    realCostCents: 65500,
  },
  {
    id: 'asset-truss',
    name: 'Box truss Q30 2 m (lote de 20 peças)',
    valueCents: 1800000,
    lifeYears: 8,
    residualPercent: 20,
    fixedCosts: [
      { name: 'Depósito', monthlyCents: 25000, account: 'Aluguel' },
      { name: 'Manutenção', monthlyCents: 5000, account: 'Manutenção' },
    ],
    referenceDays: 8,
    occupancy: [4, 6, 10, 8, 3, 12, 9, 6, 8, 11, 7, 5],
    revenueCents: 175000,
    realCostCents: 45000,
  },
  {
    id: 'asset-led',
    name: 'Painel de LED Centro',
    valueCents: 18000000,
    lifeYears: 8,
    residualPercent: 10,
    fixedCosts: [
      {
        name: 'Aluguel do ponto',
        monthlyCents: 120000,
        account: 'Aluguel de pontos',
      },
      { name: 'Energia', monthlyCents: 65000, account: 'Energia elétrica' },
      { name: 'Internet e software', monthlyCents: 18000, account: 'Software' },
    ],
    referenceDays: 21,
    occupancy: [12, 15, 18, 18, 21, 21, 24, 24, 21, 25, 25, 25],
    revenueCents: 600000,
    realCostCents: 372000,
  },
]

export const depreciationOf = (asset: RentalAsset) =>
  Math.round(
    (asset.valueCents * (1 - asset.residualPercent / 100)) /
      (asset.lifeYears * 12),
  )

export const monthlyCostOf = (asset: RentalAsset) =>
  depreciationOf(asset) +
  asset.fixedCosts.reduce((sum, cost) => sum + cost.monthlyCents, 0)

// A mesma conta para todos, como a da máquina: custo mensal ÷ média mensal.
// A média mensal do bem de locação é quanto ele costuma estar alugado: dias
// por mês de cada unidade (o outdoor, cada peça, cada espaço de anúncio)
export const dailyCostOf = (asset: RentalAsset, capacity = 1) =>
  monthlyCostOf(asset) / Math.max(asset.referenceDays, 1) / capacity

export const average = (values: number[]) =>
  values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0

// Cláusulas padrão do contrato (LC-15): a empresa edita em Configurações
export interface ContractModel {
  id: string
  name: string
  clauses: { title: string; text: string }[]
}

export const CONTRACT_MODELS: ContractModel[] = [
  {
    id: 'midia',
    name: 'Outdoor e painéis',
    clauses: [
      {
        title: 'Objeto',
        text: 'A LOCADORA cede à LOCATÁRIA o espaço publicitário descrito neste contrato, pelo período e pelo valor aqui indicados, para a veiculação de mensagem publicitária de responsabilidade da LOCATÁRIA.',
      },
      {
        title: 'Arte e veiculação',
        text: 'A arte é entregue pela LOCATÁRIA na medida indicada, com até 5 dias úteis de antecedência. O conteúdo veiculado é de responsabilidade da LOCATÁRIA e respeita a legislação e as normas do CONAR.',
      },
      {
        title: 'Instalação e retirada',
        text: 'A instalação e a retirada do material são feitas pela LOCADORA, nas datas de início e de fim do período. A impressão do material, quando contratada, é cobrada à parte.',
      },
      {
        title: 'Danos e manutenção',
        text: 'A LOCADORA mantém a estrutura e a iluminação em condições de uso. Danos causados por vento, chuva ou terceiros são reparados pela LOCADORA em até 5 dias úteis, sem desconto no período.',
      },
      {
        title: 'Rescisão',
        text: 'A rescisão antes do fim do período, por iniciativa da LOCATÁRIA, obriga ao pagamento de multa de 30% sobre o valor do período restante.',
      },
      {
        title: 'Foro',
        text: 'Fica eleito o foro da comarca da LOCADORA para resolver as questões deste contrato.',
      },
    ],
  },
  {
    id: 'evento',
    name: 'Eventos (estruturas e mobiliário)',
    clauses: [
      {
        title: 'Objeto',
        text: 'A LOCADORA aluga à LOCATÁRIA as peças relacionadas neste contrato, nas quantidades, no período e pelo valor aqui indicados.',
      },
      {
        title: 'Entrega e devolução',
        text: 'As peças são entregues e retiradas no endereço do evento, com conferência das quantidades e do estado na entrega e na devolução, assinada pelas duas partes.',
      },
      {
        title: 'Uso e conservação',
        text: 'A LOCATÁRIA responde pelas peças do recebimento à devolução. Peças danificadas ou não devolvidas são cobradas pelo valor de reposição.',
      },
      {
        title: 'Atraso na devolução',
        text: 'Cada dia de atraso na devolução é cobrado pelo valor da diária de cada peça.',
      },
      {
        title: 'Rescisão',
        text: 'O cancelamento com menos de 48 horas do início obriga ao pagamento de 50% do valor contratado.',
      },
      {
        title: 'Foro',
        text: 'Fica eleito o foro da comarca da LOCADORA para resolver as questões deste contrato.',
      },
    ],
  },
]
