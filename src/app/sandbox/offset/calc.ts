// Cálculo da gráfica offset para a vitrine (área 8 do openspec, §3.11.1 e
// §3.11.2, regras OF-1 a OF-7 e GR-1). Funções puras, sem API: é o desenho da
// conta que o backend vai fazer. Medidas em cm, valores em centavos.
//
// O caminho do papel (OF-2): a folha inteira (66 × 96) é cortada em folhas de
// máquina, e a folha de máquina recebe as peças. A peça ocupa o tamanho final
// mais a sangria (GR-1). A pinça é da máquina e come a borda de entrada.

export interface Paper {
  id: string
  name: string
  // Folha inteira, como o papel é comprado
  width: number
  height: number
  // Custo de uma folha inteira
  costCents: number
}

// OF-7: a máquina offset como tipo próprio de patrimônio
export interface OffsetMachine {
  id: string
  name: string
  // Formato máximo e mínimo da folha que a máquina aceita
  maxWidth: number
  maxHeight: number
  minWidth: number
  minHeight: number
  // Margem de pinça, em mm, na borda maior da folha (a que entra na máquina)
  gripperMm: number
  // Torres: quantas cores imprime por passada
  towers: number
  workAndTurn: boolean
  // OF-3: folhas de acerto por chapa, somadas à tiragem
  makereadySheetsPerPlate: number
  // OF-1: a chapa (material) e a gravação, por chapa
  plateCents: number
  engravingCents: number
  // Preparo por chapa, em minutos (CP-15: uma vez por trabalho)
  setupMinutesPerPlate: number
  hourCents: number
  // Folhas por hora, por passada
  sheetsPerHour: number
}

export type WorkAndTurnChoice = 'AUTO' | 'NO'

export interface OffsetJob {
  // Tamanho final da peça (o do corte), como o vendedor digita
  width: number
  height: number
  quantity: number
  frontColors: number
  backColors: number
  // Sangria por lado, em mm (GR-1.1: padrão do setor, ajuste no produto e no item)
  bleedMm: number
  workAndTurn: WorkAndTurnChoice
}

export interface Fit {
  count: number
  cols: number
  rows: number
  // A peça entrou deitada (largura e altura trocadas)
  rotated: boolean
}

// AP-1: quantas peças cabem, nas duas posições; fica a melhor
export const fit = (
  areaWidth: number,
  areaHeight: number,
  pieceWidth: number,
  pieceHeight: number,
): Fit => {
  const eps = 1e-6
  const grid = (w: number, h: number, rotated: boolean): Fit => {
    const cols = w > 0 ? Math.floor((areaWidth + eps) / w) : 0
    const rows = h > 0 ? Math.floor((areaHeight + eps) / h) : 0
    return { count: Math.max(cols * rows, 0), cols, rows, rotated }
  }
  const straight = grid(pieceWidth, pieceHeight, false)
  const turned = grid(pieceHeight, pieceWidth, true)
  return turned.count > straight.count ? turned : straight
}

export interface MachineSheet {
  // Lado menor e lado maior da folha de máquina
  short: number
  long: number
  // Folhas de máquina por folha inteira
  perFullSheet: number
  // Como sai da folha inteira: corte exato (sem apara) ou refile para o formato da máquina
  cut: 'EXACT' | 'TRIMMED'
  // A divisão da folha inteira, para o desenho
  across: number
  down: number
  // A folha de máquina deitada dentro da folha inteira
  rotatedInFull: boolean
}

const round2 = (value: number) => Math.round(value * 100) / 100

const fitsMachine = (short: number, long: number, machine: OffsetMachine) => {
  const maxShort = Math.min(machine.maxWidth, machine.maxHeight)
  const maxLong = Math.max(machine.maxWidth, machine.maxHeight)
  const minShort = Math.min(machine.minWidth, machine.minHeight)
  const minLong = Math.max(machine.minWidth, machine.minHeight)
  const eps = 1e-6
  return (
    short <= maxShort + eps &&
    long <= maxLong + eps &&
    short >= minShort - eps &&
    long >= minLong - eps
  )
}

// OF-2, primeiro corte: as folhas de máquina que a folha inteira dá para esta
// máquina. Entram as divisões exatas (meia, um quarto, um terço...) e o
// formato máximo da máquina refilado da folha inteira
export const machineSheetsOf = (
  paper: Paper,
  machine: OffsetMachine,
): MachineSheet[] => {
  const list: MachineSheet[] = []
  const add = (sheet: MachineSheet) => {
    const same = list.find(
      (item) =>
        Math.abs(item.short - sheet.short) < 0.01 &&
        Math.abs(item.long - sheet.long) < 0.01,
    )
    if (!same) list.push(sheet)
    else if (sheet.perFullSheet > same.perFullSheet) Object.assign(same, sheet)
  }
  for (let across = 1; across <= 4; across++) {
    for (let down = 1; down <= 4; down++) {
      const w = round2(paper.width / across)
      const h = round2(paper.height / down)
      const short = Math.min(w, h)
      const long = Math.max(w, h)
      if (!fitsMachine(short, long, machine)) continue
      add({
        short,
        long,
        perFullSheet: across * down,
        cut: 'EXACT',
        across,
        down,
        rotatedInFull: w > h,
      })
    }
  }
  const short = Math.min(machine.maxWidth, machine.maxHeight)
  const long = Math.max(machine.maxWidth, machine.maxHeight)
  const inFull = fit(paper.width, paper.height, short, long)
  if (inFull.count > 0) {
    add({
      short,
      long,
      perFullSheet: inFull.count,
      cut: 'TRIMMED',
      across: inFull.cols,
      down: inFull.rows,
      rotatedInFull: inFull.rotated,
    })
  }
  return list
}

export interface OffsetCosts {
  paperCents: number
  platesCents: number
  setupCents: number
  runCents: number
  totalCents: number
}

export interface OffsetResult {
  machine: OffsetMachine
  sheet: MachineSheet
  // A peça com a sangria
  pieceWidth: number
  pieceHeight: number
  // Área que recebe as peças: a folha de máquina sem a pinça
  usableShort: number
  usableLong: number
  layout: Fit
  piecesPerSheet: number
  workAndTurn: boolean
  plates: number
  // Passadas na máquina por folha (frente e verso, e as cores além das torres)
  passesPerSheet: number
  runSheets: number
  makereadySheets: number
  machineSheets: number
  fullSheets: number
  setupMinutes: number
  runMinutes: number
  costs: OffsetCosts
  unitCents: number
}

const passesOf = (colors: number, towers: number) =>
  colors > 0 ? Math.ceil(colors / Math.max(towers, 1)) : 0

const evaluate = (
  job: OffsetJob,
  paper: Paper,
  machine: OffsetMachine,
  sheet: MachineSheet,
): OffsetResult | null => {
  const bleed = (job.bleedMm * 2) / 10
  const pieceWidth = job.width + bleed
  const pieceHeight = job.height + bleed
  // A pinça fica na borda maior: tira do lado menor
  const usableShort = sheet.short - machine.gripperMm / 10
  const usableLong = sheet.long
  const layout = fit(usableShort, usableLong, pieceWidth, pieceHeight)
  if (!layout.count) return null

  // OF-6, tira e retira: frente e verso na mesma folha, com um jogo de chapas.
  // Pede as mesmas cores dos dois lados e um número par de peças na folha
  const twoSided = job.backColors > 0
  const workAndTurn =
    twoSided &&
    job.workAndTurn === 'AUTO' &&
    machine.workAndTurn &&
    job.frontColors === job.backColors &&
    layout.count >= 2
  const piecesPerSheet = workAndTurn
    ? layout.count - (layout.count % 2)
    : layout.count

  // OF-1: uma chapa por cor de cada lado; no tira e retira, só um lado
  const plates = workAndTurn
    ? job.frontColors
    : job.frontColors + job.backColors
  const passesFront = passesOf(job.frontColors, machine.towers)
  const passesBack = workAndTurn
    ? passesFront
    : passesOf(job.backColors, machine.towers)
  const passesPerSheet = passesFront + passesBack

  const runSheets = Math.ceil(job.quantity / piecesPerSheet)
  // OF-3: o acerto gasta folhas fixas por chapa, não um percentual
  const makereadySheets = plates * machine.makereadySheetsPerPlate
  const machineSheets = runSheets + makereadySheets
  const fullSheets = Math.ceil(machineSheets / sheet.perFullSheet)

  const setupMinutes = plates * machine.setupMinutesPerPlate
  const runMinutes =
    ((machineSheets * passesPerSheet) / Math.max(machine.sheetsPerHour, 1)) * 60
  const paperCents = fullSheets * paper.costCents
  const platesCents = plates * (machine.plateCents + machine.engravingCents)
  const setupCents = Math.round((setupMinutes / 60) * machine.hourCents)
  const runCents = Math.round((runMinutes / 60) * machine.hourCents)
  const totalCents = paperCents + platesCents + setupCents + runCents

  return {
    machine,
    sheet,
    pieceWidth,
    pieceHeight,
    usableShort,
    usableLong,
    layout,
    piecesPerSheet,
    workAndTurn,
    plates,
    passesPerSheet,
    runSheets,
    makereadySheets,
    machineSheets,
    fullSheets,
    setupMinutes,
    runMinutes,
    costs: { paperCents, platesCents, setupCents, runCents, totalCents },
    unitCents: totalCents / Math.max(job.quantity, 1),
  }
}

// O melhor jeito de rodar o trabalho nesta máquina: a folha de máquina de
// menor custo. Nulo quando a peça não cabe em nenhuma folha que a máquina aceita
export const bestForMachine = (
  job: OffsetJob,
  paper: Paper,
  machine: OffsetMachine,
): OffsetResult | null => {
  let best: OffsetResult | null = null
  for (const sheet of machineSheetsOf(paper, machine)) {
    const result = evaluate(job, paper, machine, sheet)
    if (result && (!best || result.costs.totalCents < best.costs.totalCents))
      best = result
  }
  return best
}

// OF-5: o cálculo testa as máquinas viáveis e fica com a de menor custo. O
// mesmo orçamento dá sempre o mesmo preço; a IA só explica
export const rank = (
  job: OffsetJob,
  paper: Paper,
  machines: OffsetMachine[],
): { viable: OffsetResult[]; unfit: OffsetMachine[] } => {
  const viable: OffsetResult[] = []
  const unfit: OffsetMachine[] = []
  for (const machine of machines) {
    const result = bestForMachine(job, paper, machine)
    if (result) viable.push(result)
    else unfit.push(machine)
  }
  viable.sort((a, b) => a.costs.totalCents - b.costs.totalCents)
  return { viable, unfit }
}

export const formatBrl = (cents: number, digits = 2) =>
  (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })

export const formatCm = (value: number) =>
  value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })

export const formatInt = (value: number) => value.toLocaleString('pt-BR')

export const formatTime = (minutes: number) => {
  const total = Math.round(minutes)
  const hours = Math.floor(total / 60)
  const rest = total % 60
  return hours
    ? `${hours} h ${String(rest).padStart(2, '0')} min`
    : `${rest} min`
}

// A explicação da escolha (OF-5): texto montado com os números do cálculo.
// Na tela real, é o que a IA diz; nenhum valor sai do modelo (área 11)
export const explain = (viable: OffsetResult[], job: OffsetJob): string[] => {
  const [best, second] = viable
  if (!best) return []
  const lines = [
    `${best.machine.name}: ${best.piecesPerSheet} peças por folha de ${formatCm(best.sheet.short)} × ${formatCm(best.sheet.long)} cm, ${formatInt(best.machineSheets)} folhas de máquina (${formatInt(best.makereadySheets)} de acerto) e ${best.plates} ${best.plates === 1 ? 'chapa' : 'chapas'}.`,
  ]
  if (best.workAndTurn)
    lines.push(
      `Com tira e retira, o verso usa as mesmas ${best.plates} chapas da frente: sem ele seriam ${job.frontColors + job.backColors}.`,
    )
  if (second) {
    const diff = second.costs.totalCents - best.costs.totalCents
    // O que mais pesa na diferença: papel, custo fixo (chapas e acerto) ou tempo de máquina
    const deltas: [string, number][] = [
      ['gasta mais papel', second.costs.paperCents - best.costs.paperCents],
      [
        'tem mais custo fixo de chapas e acerto',
        second.costs.platesCents +
          second.costs.setupCents -
          best.costs.platesCents -
          best.costs.setupCents,
      ],
      [
        'o tempo de máquina sai mais caro',
        second.costs.runCents - best.costs.runCents,
      ],
    ]
    const why = deltas.sort((x, y) => y[1] - x[1])[0][0]
    lines.push(
      `Na ${second.machine.name} sairia ${formatBrl(second.costs.totalCents)}, ${formatBrl(diff)} a mais: ${why} nesta tiragem.`,
    )
  }
  return lines
}

/* --------------------------------------------------------------------------
 * Dados de exemplo
 * ------------------------------------------------------------------------ */

export const PAPERS: Paper[] = [
  {
    id: 'couche-90',
    name: 'Couché 90 g · 66 × 96',
    width: 66,
    height: 96,
    costCents: 52,
  },
  {
    id: 'couche-115',
    name: 'Couché 115 g · 66 × 96',
    width: 66,
    height: 96,
    costCents: 66,
  },
  {
    id: 'couche-300',
    name: 'Couché 300 g · 66 × 96',
    width: 66,
    height: 96,
    costCents: 175,
  },
  {
    id: 'offset-75',
    name: 'Offset 75 g · 66 × 96',
    width: 66,
    height: 96,
    costCents: 40,
  },
  {
    id: 'offset-90-64',
    name: 'Offset 90 g · 64 × 88',
    width: 64,
    height: 88,
    costCents: 44,
  },
]

export const MACHINES: OffsetMachine[] = [
  {
    id: 'f4-1cor',
    name: 'Offset formato 4 · 1 cor',
    maxWidth: 36,
    maxHeight: 52,
    minWidth: 10,
    minHeight: 15,
    gripperMm: 10,
    towers: 1,
    workAndTurn: true,
    makereadySheetsPerPlate: 30,
    plateCents: 1200,
    engravingCents: 800,
    setupMinutesPerPlate: 12,
    hourCents: 9000,
    sheetsPerHour: 5000,
  },
  {
    id: 'f2-2cores',
    name: 'Offset formato 2 · 2 cores',
    maxWidth: 48,
    maxHeight: 66,
    minWidth: 21,
    minHeight: 28,
    gripperMm: 10,
    towers: 2,
    workAndTurn: true,
    makereadySheetsPerPlate: 50,
    plateCents: 2200,
    engravingCents: 1200,
    setupMinutesPerPlate: 12,
    hourCents: 16000,
    sheetsPerHour: 7000,
  },
  {
    id: 'f2-4cores',
    name: 'Offset formato 2 · 4 cores',
    maxWidth: 42,
    maxHeight: 64,
    minWidth: 21,
    minHeight: 28,
    gripperMm: 10,
    towers: 4,
    workAndTurn: true,
    makereadySheetsPerPlate: 50,
    plateCents: 2200,
    engravingCents: 1200,
    setupMinutesPerPlate: 10,
    hourCents: 28000,
    sheetsPerHour: 9000,
  },
]

export const COLOR_OPTIONS: { id: string; front: number; back: number }[] = [
  { id: '4x4', front: 4, back: 4 },
  { id: '4x0', front: 4, back: 0 },
  { id: '4x1', front: 4, back: 1 },
  { id: '2x2', front: 2, back: 2 },
  { id: '2x0', front: 2, back: 0 },
  { id: '1x1', front: 1, back: 1 },
  { id: '1x0', front: 1, back: 0 },
]

// O exemplo do cliente (29/10/2026): 50.000 panfletos 10 × 21, 4x4, couché 90
export const CLIENT_JOB: OffsetJob = {
  width: 10,
  height: 21,
  quantity: 50000,
  frontColors: 4,
  backColors: 4,
  bleedMm: 2,
  workAndTurn: 'AUTO',
}
