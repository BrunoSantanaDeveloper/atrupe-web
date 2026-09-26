'use server'

// PROVISÓRIO: a API ainda não tem a composição por etapas (recurso do PRO).
// Dados de exemplo em memória. O cálculo fica aqui, no servidor, e a tela só
// mostra o resultado (SEG-1): quem monta o produto não vê a fórmula rodando
// no navegador.
//
// Os números do Banner são os do legado (pro.atrupe.com.br, ITP1), para a
// tela poder ser conferida contra ele.

// Types
import type {
  SaleRules,
  AssemblyLine,
  AssemblyBlock,
  AssemblyMeasure,
  ComputedLine,
  ComputedBlock,
  ProductAssembly,
  ComputedAssembly,
  ProductVariation,
  ProcessCatalogItem,
} from '@/app/(app-sidebar)/configuracoes/produtos/[id]/composicao/assembly'

// Markup de referência da empresa, vindo da Precificação (PR-1)
const REFERENCE_MARKUP = 1.68

const uid = () => Math.random().toString(36).slice(2, 9)

// Custo por minuto da mão de obra do setor, a partir do custo-hora da Base de
// custos (em centavos)
const HOUR: { [sector: string]: number } = {
  Criação: 3000,
  Impressão: 2890,
  Produção: 1649,
  Instalação: 4200,
}
const perMinute = (sector: string) => (HOUR[sector] || 1800) / 60

const baseRules: SaleRules = {
  quantityMode: 'FREE',
  followsBase: true,
  dimension: 'FREE_SIZE',
  timeField: false,
  extraField: 'NONE',
  extraFieldName: '',
  extraFieldDefault: 0,
  descriptionEditable: true,
}

// O acabamento herda a medida da base, esconde a quantidade e acompanha a
// quantidade da base — o padrão que o legado mostra (MS-3 a MS-5)
const finishingRules: SaleRules = {
  ...baseRules,
  quantityMode: 'HIDDEN_ONE',
  dimension: 'SAME_AS_PARENT',
  descriptionEditable: false,
}

type Template = Omit<
  AssemblyBlock,
  'id' | 'baseBlockId' | 'localRules' | 'lines'
> & {
  finishingOf: string | null
  lines: Omit<AssemblyLine, 'id' | 'overridden'>[]
}

const labor = (sector: string) => ({
  id: `mo-${sector}`,
  name: `Mão de obra · ${sector}`,
  unit: 'min',
  unitCost: perMinute(sector),
})

const substrates = [
  { id: 'lona440', name: 'Lona 440 g', unit: 'm²', unitCost: 1250 },
  { id: 'lona380', name: 'Lona 380 g', unit: 'm²', unitCost: 980 },
  { id: 'adbranco', name: 'Adesivo branco brilho', unit: 'm²', unitCost: 1100 },
  { id: 'adtransp', name: 'Adesivo transparente', unit: 'm²', unitCost: 1300 },
  { id: 'perfurado', name: 'Perfurado', unit: 'm²', unitCost: 1500 },
]

const catalog: Template[] = [
  {
    processId: 'impressao-solvente',
    name: 'Impressão solvente',
    sector: 'Impressão',
    role: 'BASE',
    finishingOf: null,
    setupMinutes: 10,
    sectorHourCost: HOUR['Impressão'],
    taskType: 'Impressão',
    originalRules: baseRules,
    lines: [
      {
        name: 'Qualidade',
        kind: 'MACHINE',
        mode: 'CHOOSE',
        options: [
          {
            id: 'solv4',
            name: 'Impressora solvente · 4 passes',
            unit: 'm²',
            unitCost: 289,
          },
          {
            id: 'solv6',
            name: 'Impressora solvente · 6 passes',
            unit: 'm²',
            unitCost: 410,
          },
        ],
        selectedId: 'solv4',
        perUnit: 1,
        formula: 'PER_AREA',
        lossPercent: 0,
        minimum: null,
      },
      {
        name: 'Material',
        kind: 'MATERIAL',
        mode: 'CHOOSE',
        options: substrates,
        selectedId: 'lona440',
        perUnit: 1,
        formula: 'PER_AREA',
        // Os 1,2 m² por m² do legado, como percentual explícito
        lossPercent: 20,
        minimum: 0.5,
      },
    ],
  },
  {
    processId: 'acabamento-banner',
    name: 'Acabamento de banner',
    sector: 'Produção',
    role: 'FINISHING',
    finishingOf: 'Impressão',
    setupMinutes: 10,
    sectorHourCost: HOUR['Produção'],
    taskType: 'Produção',
    originalRules: finishingRules,
    lines: [
      {
        name: 'Tempo por banner',
        kind: 'LABOR',
        mode: 'SINGLE',
        options: [labor('Produção')],
        selectedId: 'mo-Produção',
        perUnit: 10,
        formula: 'PER_UNIT',
        lossPercent: 0,
        minimum: null,
      },
      {
        name: 'Madeira',
        kind: 'MATERIAL',
        mode: 'SINGLE',
        options: [
          {
            id: 'madeira',
            name: 'Madeira de banner',
            unit: 'm',
            unitCost: 200,
          },
        ],
        selectedId: 'madeira',
        perUnit: 2.2,
        formula: 'PER_WIDTH',
        lossPercent: 0,
        minimum: 1,
      },
      {
        name: 'Ponteira',
        kind: 'MATERIAL',
        mode: 'SINGLE',
        options: [
          { id: 'ponteira', name: 'Ponteira', unit: 'un', unitCost: 20 },
        ],
        selectedId: 'ponteira',
        perUnit: 4,
        formula: 'PER_UNIT',
        lossPercent: 0,
        minimum: null,
      },
      {
        name: 'Cordão',
        kind: 'MATERIAL',
        mode: 'SINGLE',
        options: [{ id: 'cordao', name: 'Cordão', unit: 'm', unitCost: 100 }],
        selectedId: 'cordao',
        perUnit: 1.2,
        formula: 'PER_WIDTH',
        lossPercent: 0,
        minimum: null,
      },
    ],
  },
  {
    processId: 'bainha',
    name: 'Bainha',
    sector: 'Produção',
    role: 'FINISHING',
    finishingOf: 'Impressão',
    setupMinutes: 10,
    sectorHourCost: HOUR['Produção'],
    taskType: 'Produção',
    originalRules: finishingRules,
    lines: [
      {
        name: 'Tempo por metro de bainha',
        kind: 'LABOR',
        mode: 'SINGLE',
        options: [labor('Produção')],
        selectedId: 'mo-Produção',
        perUnit: 3,
        formula: 'PER_PERIMETER',
        lossPercent: 0,
        minimum: null,
      },
      {
        name: 'Cola',
        kind: 'MATERIAL',
        mode: 'SINGLE',
        options: [
          { id: 'cola', name: 'Cola de contato', unit: 'kg', unitCost: 14000 },
        ],
        selectedId: 'cola',
        perUnit: 0.05,
        formula: 'PER_PERIMETER',
        lossPercent: 0,
        minimum: null,
      },
    ],
  },
  {
    processId: 'ilhos',
    name: 'Ilhós',
    sector: 'Produção',
    role: 'FINISHING',
    finishingOf: 'Impressão',
    setupMinutes: 5,
    sectorHourCost: HOUR['Produção'],
    taskType: 'Produção',
    // O campo extra do ilhós é o espaçamento, com casas decimais (IP-19)
    originalRules: {
      ...finishingRules,
      extraField: 'DECIMAL',
      extraFieldName: 'Distância entre ilhoses (m)',
      extraFieldDefault: 0.5,
    },
    lines: [
      {
        name: 'Tempo por ilhós',
        kind: 'LABOR',
        mode: 'SINGLE',
        options: [labor('Produção')],
        selectedId: 'mo-Produção',
        perUnit: 1,
        formula: 'PER_PERIMETER_DIV_EXTRA',
        lossPercent: 0,
        minimum: null,
      },
      {
        name: 'Ilhós',
        kind: 'MATERIAL',
        mode: 'SINGLE',
        options: [
          { id: 'ilhos', name: 'Ilhós nº 0', unit: 'un', unitCost: 20 },
        ],
        selectedId: 'ilhos',
        perUnit: 1,
        formula: 'PER_PERIMETER_DIV_EXTRA',
        lossPercent: 0,
        minimum: null,
      },
    ],
  },
  {
    processId: 'laminacao',
    name: 'Laminação',
    sector: 'Produção',
    role: 'FINISHING',
    finishingOf: 'Impressão',
    setupMinutes: 5,
    sectorHourCost: HOUR['Produção'],
    taskType: 'Produção',
    originalRules: finishingRules,
    lines: [
      {
        name: 'Filme',
        kind: 'MATERIAL',
        mode: 'CHOOSE',
        options: [
          {
            id: 'lambrilho',
            name: 'Laminação brilho',
            unit: 'm²',
            unitCost: 700,
          },
          {
            id: 'lamfosco',
            name: 'Laminação fosca',
            unit: 'm²',
            unitCost: 780,
          },
        ],
        selectedId: 'lambrilho',
        perUnit: 1,
        formula: 'PER_AREA',
        lossPercent: 10,
        minimum: null,
      },
    ],
  },
  {
    processId: 'arte',
    name: 'Criação da arte',
    sector: 'Criação',
    role: 'BASE',
    finishingOf: null,
    setupMinutes: 0,
    sectorHourCost: HOUR['Criação'],
    taskType: 'Criação',
    // A arte é uma por pedido, não por peça, e sem medida
    originalRules: {
      ...baseRules,
      quantityMode: 'HIDDEN_ONE',
      followsBase: false,
      dimension: 'NONE',
      timeField: true,
    },
    lines: [
      {
        name: 'Tempo de criação',
        kind: 'LABOR',
        mode: 'SINGLE',
        options: [labor('Criação')],
        selectedId: 'mo-Criação',
        perUnit: 30,
        formula: 'FIXED',
        lossPercent: 0,
        minimum: null,
      },
    ],
  },
  {
    processId: 'instalacao',
    name: 'Instalação',
    sector: 'Instalação',
    role: 'BASE',
    finishingOf: null,
    setupMinutes: 0,
    sectorHourCost: HOUR['Instalação'],
    taskType: 'Instalação',
    originalRules: {
      ...baseRules,
      quantityMode: 'HIDDEN_ONE',
      followsBase: false,
      dimension: 'NONE',
    },
    lines: [
      {
        name: 'Equipe de instalação',
        kind: 'LABOR',
        mode: 'SINGLE',
        options: [labor('Instalação')],
        selectedId: 'mo-Instalação',
        perUnit: 60,
        formula: 'FIXED',
        lossPercent: 0,
        minimum: null,
      },
      {
        name: 'Material de fixação',
        kind: 'MATERIAL',
        mode: 'LIST',
        options: [
          {
            id: 'parafuso',
            name: 'Parafuso com bucha',
            unit: 'un',
            unitCost: 35,
          },
          { id: 'abracadeira', name: 'Abraçadeira', unit: 'un', unitCost: 50 },
          { id: 'fitadf', name: 'Fita dupla face', unit: 'm', unitCost: 120 },
        ],
        selectedId: '',
        perUnit: 0,
        formula: 'SELLER',
        lossPercent: 0,
        minimum: null,
      },
    ],
  },
]

const fromTemplate = (
  template: Template,
  baseBlockId: string | null,
): AssemblyBlock => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { finishingOf, lines, ...rest } = template
  return {
    ...rest,
    id: `b${uid()}`,
    baseBlockId,
    localRules: null,
    lines: lines.map((line) => ({
      ...line,
      id: `l${uid()}`,
      overridden: false,
    })),
  }
}

const templateOf = (processId: string) =>
  catalog.find((item) => item.processId === processId)

// O Banner do legado (ITP1): impressão solvente + acabamento de banner
const bannerBase = fromTemplate(templateOf('impressao-solvente')!, null)
const assemblies: ProductAssembly[] = [
  {
    productId: 'banner',
    name: 'Banner 440 com bastão',
    code: 'PRD-01',
    status: 'RELEASED',
    dimension: 'SALE',
    unitKind: 'AREA',
    unitPrice: 4500,
    measure: { quantity: 1, width: 0.9, height: 1.2 },
    unitAmount: 1,
    allowEditValues: true,
    allowEditDescription: true,
    technicalDescription:
      'Lona 440 g impressa em solvente, com bastão de madeira, ponteiras e cordão.',
    blocks: [
      bannerBase,
      fromTemplate(templateOf('acabamento-banner')!, bannerBase.id),
    ],
    variations: [
      {
        // A mesma composição com a lona mais barata e preço próprio
        id: 'v-economica',
        name: 'Econômico · lona 380',
        unitPrice: 3900,
        overrides: [
          {
            blockId: bannerBase.id,
            lineId: bannerBase.lines[1].id,
            selectedId: 'lona380',
          },
        ],
      },
      {
        // Mais qualidade de impressão, e o preço do produto
        id: 'v-alta',
        name: 'Alta definição · 6 passes',
        unitPrice: null,
        overrides: [
          {
            blockId: bannerBase.id,
            lineId: bannerBase.lines[0].id,
            selectedId: 'solv6',
          },
        ],
      },
    ],
  },
]

const findOrCreate = (productId: string) => {
  let found = assemblies.find((item) => item.productId === productId)
  if (!found) {
    found = {
      productId,
      name: 'Produto',
      code: '',
      status: 'DRAFT',
      dimension: 'SALE',
      unitKind: 'UNITY',
      unitPrice: null,
      measure: { quantity: 1, width: 1, height: 1 },
      unitAmount: 1,
      allowEditValues: true,
      allowEditDescription: true,
      technicalDescription: '',
      blocks: [],
      variations: [],
    }
    assemblies.push(found)
  }
  return found
}

/* ---------------------------------------------------------------------------
 * O cálculo
 * ------------------------------------------------------------------------- */

const round = (value: number, digits = 2) =>
  Math.round(value * 10 ** digits) / 10 ** digits

const lineQuantity = (
  line: AssemblyLine,
  measure: AssemblyMeasure,
  extra: number,
) => {
  const { quantity: n, width: w, height: h } = measure
  const area = w * h
  const perimeter = 2 * (w + h)
  const k = line.perUnit

  switch (line.formula) {
    case 'FIXED':
      return k
    case 'SELLER':
      return null
    case 'PER_AREA':
      return k * area * n
    case 'PER_UNIT':
      return k * n
    case 'PER_PERIMETER':
      return k * perimeter * n
    case 'PER_WIDTH':
      return k * w * n
    case 'PER_HEIGHT':
      return k * h * n
    case 'PER_EXTRA':
      return k * extra * n
    case 'PER_TIME':
      return k * n
    case 'PER_PERIMETER_DIV_EXTRA':
      // Quantos cabem no perímetro: nunca fração de ilhós
      return extra > 0 ? Math.ceil(perimeter / extra) * k * n : null
    case 'TIME_TIMES_EXTRA':
      return k * extra
    case 'EQUAL_TIME':
      return k
    case 'PER_WIDTH_EXTRA':
      return k * w * extra * n
    case 'PER_HEIGHT_EXTRA':
      return k * h * extra * n
    case 'EXTRA_ONLY':
      return k * extra
    case 'PER_AREA_DIV_EXTRA':
      return extra > 0 ? (k * area * n) / extra : null
    case 'PER_PERIMETER_EXTRA':
      return k * perimeter * extra * n
    case 'DIV_EXTRA':
      return extra > 0 ? k / extra : null
    case 'AREA_EXTRA':
      return k * area * extra
    case 'PER_AREA_EXTRA':
      return k * area * extra * n
    default:
      return null
  }
}

const applyVariation = (
  assembly: ProductAssembly,
  variation: ProductVariation | null,
) =>
  variation
    ? {
        ...assembly,
        blocks: assembly.blocks.map((block) => ({
          ...block,
          lines: block.lines.map((line) => {
            const override = variation.overrides.find(
              (item) => item.blockId === block.id && item.lineId === line.id,
            )
            return override
              ? {
                  ...line,
                  ...(override.selectedId !== undefined && {
                    selectedId: override.selectedId,
                  }),
                  ...(override.perUnit !== undefined && {
                    perUnit: override.perUnit,
                  }),
                }
              : line
          }),
        })),
      }
    : assembly

const compute = (
  source: ProductAssembly,
  variation: ProductVariation | null = null,
): ComputedAssembly => {
  const assembly = applyVariation(source, variation)
  // Sem preço próprio, a variação vale o preço do produto (PV-4)
  const unitPrice = variation?.unitPrice ?? assembly.unitPrice
  const { measure } = assembly
  const area = round(measure.width * measure.height, 4)
  const blocks: ComputedBlock[] = []

  for (const block of assembly.blocks) {
    const rules = block.localRules ?? block.originalRules
    const base = blocks.find((item) => item.id === block.baseBlockId)
    const reference = base?.measure ?? measure

    const size =
      rules.dimension === 'SAME_AS_PARENT'
        ? { width: reference.width, height: reference.height }
        : rules.dimension === 'NONE'
          ? { width: 0, height: 0 }
          : { width: measure.width, height: measure.height }

    const baseQuantity = rules.followsBase ? reference.quantity : 1
    const quantity =
      rules.quantityMode === 'FREE'
        ? measure.quantity
        : rules.quantityMode === 'AREA_RATIO'
          ? Math.max(
              1,
              Math.floor(
                (reference.width * reference.height) /
                  Math.max(size.width * size.height, 0.0001),
              ),
            ) * baseQuantity
          : baseQuantity

    const blockMeasure = { quantity, ...size }
    const extra = rules.extraField === 'NONE' ? 0 : rules.extraFieldDefault

    const lines: ComputedLine[] = block.lines.map((line) => {
      const selected =
        line.mode === 'LIST'
          ? null
          : line.options.find((option) => option.id === line.selectedId) ||
            line.options[0] ||
            null

      // A lista é preenchida pelo vendedor: aqui não tem quantidade (IP-8)
      const raw =
        line.mode === 'LIST' ? null : lineQuantity(line, blockMeasure, extra)

      let qty = raw === null ? null : raw * (1 + (line.lossPercent || 0) / 100)
      if (qty !== null && line.minimum !== null) {
        qty = Math.max(qty, line.minimum)
      }
      qty = qty === null ? null : round(qty, 3)

      return {
        ...line,
        variationOverride: !!variation?.overrides.some(
          (item) => item.blockId === block.id && item.lineId === line.id,
        ),
        selected,
        quantity: qty,
        cost:
          qty === null || !selected
            ? null
            : Math.round(qty * selected.unitCost),
      }
    })

    // O preparo entra uma vez por pedido (CP-15)
    const setupCost = Math.round(
      (block.setupMinutes * block.sectorHourCost) / 60,
    )

    blocks.push({
      ...block,
      rules,
      measure: blockMeasure,
      setupCost,
      lines,
      cost: setupCost + lines.reduce((sum, line) => sum + (line.cost || 0), 0),
    })
  }

  const cost = blocks.reduce((sum, block) => sum + block.cost, 0)
  const suggestedPrice = Math.round(cost * REFERENCE_MARKUP)

  // Quanto de unidade comercial a medida tem, como o "Valor" do START
  const saleAmount =
    assembly.unitKind === 'AREA'
      ? area * measure.quantity
      : assembly.unitKind === 'UNITY'
        ? measure.quantity
        : assembly.unitAmount * measure.quantity

  const priceForMeasure =
    unitPrice === null ? null : Math.round(unitPrice * saleAmount)

  return {
    ...assembly,
    area,
    blocks,
    cost,
    suggestedPrice,
    saleAmount: round(saleAmount, 4),
    priceForMeasure,
    suggestedUnitPrice: Math.round(
      suggestedPrice / Math.max(saleAmount, 0.0001),
    ),
    activeVariation: variation,
    variationSummary: [],
    // Produto sem composição nunca aparece com margem zero (DC-15)
    margin:
      priceForMeasure && cost
        ? round(((priceForMeasure - cost) / priceForMeasure) * 100, 1)
        : null,
  }
}

const ok = <T>(data: T) => ({ success: true, data, message: '' })
const fail = (message: string) => ({ success: false, data: null, message })

/* ---------------------------------------------------------------------------
 * Leitura e alteração
 * ------------------------------------------------------------------------- */

// A simulação usa a medida pedida sem gravar nada: o produto só muda quando
// a pessoa salva a medida padrão
export const getAssembly = async ({
  productId,
  measure,
  variationId,
}: {
  productId: string
  measure?: AssemblyMeasure
  variationId?: string | null
}) => {
  const assembly = findOrCreate(productId)
  const base = measure ? { ...assembly, measure } : assembly
  const variation =
    assembly.variations.find((item) => item.id === variationId) || null

  const result = compute(base, variation)
  // O custo muda por variação mesmo com preço único: é o que revela que o
  // GG dá menos margem que o P (PV-4)
  result.variationSummary = [null, ...assembly.variations].map((item) => {
    const computed = compute(base, item)
    return {
      id: item?.id || '',
      name: item?.name || 'Base',
      cost: computed.cost,
      priceForMeasure: computed.priceForMeasure,
      margin: computed.margin,
    }
  })

  return ok(result)
}

export const getProcessCatalog = async () =>
  ok(
    catalog.map(
      (item): ProcessCatalogItem => ({
        id: item.processId,
        name: item.name,
        sector: item.sector,
        role: item.role,
        finishingOf: item.finishingOf,
      }),
    ),
  )

export const updateAssembly = async ({
  productId,
  values,
}: {
  productId: string
  values: Partial<
    Pick<
      ProductAssembly,
      | 'status'
      | 'dimension'
      | 'unitKind'
      | 'unitPrice'
      | 'measure'
      | 'unitAmount'
      | 'allowEditValues'
      | 'allowEditDescription'
      | 'technicalDescription'
    >
  >
}) => {
  const assembly = findOrCreate(productId)

  if (values.status === 'RELEASED') {
    if (!assembly.blocks.length) {
      return fail('Monte a composição antes de liberar o produto para venda')
    }
    const openList = assembly.blocks.some((block) =>
      block.lines.some((line) => line.mode === 'CHOOSE' && !line.selectedId),
    )
    if (openList) {
      return fail(
        'Há linhas de escolha sem opção padrão. Escolha antes de liberar',
      )
    }
  }

  Object.assign(assembly, values)
  return ok(null)
}

export const addAssemblyBlock = async ({
  productId,
  processId,
  baseBlockId,
}: {
  productId: string
  processId: string
  baseBlockId: string | null
}) => {
  const assembly = findOrCreate(productId)
  const template = templateOf(processId)
  if (!template) return fail('Processo não encontrado')

  const block = fromTemplate(template, baseBlockId)

  // O acabamento entra logo depois da base e dos acabamentos que ela já tem
  if (baseBlockId) {
    let index = assembly.blocks.findIndex((item) => item.id === baseBlockId)
    while (assembly.blocks[index + 1]?.baseBlockId === baseBlockId) index++
    assembly.blocks.splice(index + 1, 0, block)
  } else {
    assembly.blocks.push(block)
  }

  return ok(block.id)
}

export const removeAssemblyBlock = async ({
  productId,
  blockId,
}: {
  productId: string
  blockId: string
}) => {
  const assembly = findOrCreate(productId)
  // A base sai com os acabamentos dela: acabamento sem base não existe
  assembly.blocks = assembly.blocks.filter(
    (block) => block.id !== blockId && block.baseBlockId !== blockId,
  )
  return ok(null)
}

export const moveAssemblyBlock = async ({
  productId,
  blockId,
  direction,
}: {
  productId: string
  blockId: string
  direction: 'UP' | 'DOWN'
}) => {
  const assembly = findOrCreate(productId)
  const index = assembly.blocks.findIndex((block) => block.id === blockId)
  const target = direction === 'UP' ? index - 1 : index + 1
  if (index < 0 || target < 0 || target >= assembly.blocks.length) {
    return ok(null)
  }
  const [block] = assembly.blocks.splice(index, 1)
  assembly.blocks.splice(target, 0, block)
  return ok(null)
}

// Ajustar a linha só neste produto (IP-22). O processo não muda
export const updateAssemblyLine = async ({
  productId,
  blockId,
  lineId,
  values,
}: {
  productId: string
  blockId: string
  lineId: string
  values: Partial<
    Pick<
      AssemblyLine,
      'selectedId' | 'perUnit' | 'formula' | 'lossPercent' | 'minimum'
    >
  >
}) => {
  const block = findOrCreate(productId).blocks.find(
    (item) => item.id === blockId,
  )
  const line = block?.lines.find((item) => item.id === lineId)
  if (!line) return fail('Linha não encontrada')

  // Trocar a opção escolhida não é ajuste: é o uso normal da linha
  const onlyChoice = Object.keys(values).every((key) => key === 'selectedId')
  Object.assign(line, values)
  if (!onlyChoice) line.overridden = true

  return ok(null)
}

// Volta a linha ao que o processo define
export const resetAssemblyLine = async ({
  productId,
  blockId,
  lineId,
}: {
  productId: string
  blockId: string
  lineId: string
}) => {
  const block = findOrCreate(productId).blocks.find(
    (item) => item.id === blockId,
  )
  const index = block?.lines.findIndex((item) => item.id === lineId) ?? -1
  const template = block && templateOf(block.processId)
  if (!block || index < 0 || !template) return fail('Linha não encontrada')

  const original = template.lines[index]
  block.lines[index] = {
    ...original,
    id: block.lines[index].id,
    selectedId: block.lines[index].selectedId || original.selectedId,
    overridden: false,
  }
  return ok(null)
}

// Regras de venda só para este produto (IP-18). null volta às do processo
export const setBlockLocalRules = async ({
  productId,
  blockId,
  rules,
}: {
  productId: string
  blockId: string
  rules: SaleRules | null
}) => {
  const block = findOrCreate(productId).blocks.find(
    (item) => item.id === blockId,
  )
  if (!block) return fail('Etapa não encontrada')
  block.localRules = rules
  return ok(null)
}

/* ---------------------------------------------------------------------------
 * Variações (PV-1 a PV-7)
 * ------------------------------------------------------------------------- */

export const addVariation = async ({
  productId,
  name,
}: {
  productId: string
  name: string
}) => {
  if (!name.trim()) return fail('Dê um nome para a variação')
  const assembly = findOrCreate(productId)
  const variation: ProductVariation = {
    id: `v${uid()}`,
    name: name.trim(),
    unitPrice: null,
    overrides: [],
  }
  assembly.variations.push(variation)
  return ok(variation.id)
}

export const removeVariation = async ({
  productId,
  variationId,
}: {
  productId: string
  variationId: string
}) => {
  const assembly = findOrCreate(productId)
  assembly.variations = assembly.variations.filter(
    (item) => item.id !== variationId,
  )
  return ok(null)
}

export const setVariationPrice = async ({
  productId,
  variationId,
  unitPrice,
}: {
  productId: string
  variationId: string
  unitPrice: number | null
}) => {
  const variation = findOrCreate(productId).variations.find(
    (item) => item.id === variationId,
  )
  if (!variation) return fail('Variação não encontrada')
  variation.unitPrice = unitPrice
  return ok(null)
}

// O que muda na variação vira exceção dela; o resto continua acompanhando a
// base (PV-2)
export const setVariationLine = async ({
  productId,
  variationId,
  blockId,
  lineId,
  values,
}: {
  productId: string
  variationId: string
  blockId: string
  lineId: string
  values: { selectedId?: string; perUnit?: number }
}) => {
  const variation = findOrCreate(productId).variations.find(
    (item) => item.id === variationId,
  )
  if (!variation) return fail('Variação não encontrada')

  const current = variation.overrides.find(
    (item) => item.blockId === blockId && item.lineId === lineId,
  )
  if (current) Object.assign(current, values)
  else variation.overrides.push({ blockId, lineId, ...values })
  return ok(null)
}

export const clearVariationLine = async ({
  productId,
  variationId,
  blockId,
  lineId,
}: {
  productId: string
  variationId: string
  blockId: string
  lineId: string
}) => {
  const variation = findOrCreate(productId).variations.find(
    (item) => item.id === variationId,
  )
  if (!variation) return fail('Variação não encontrada')
  variation.overrides = variation.overrides.filter(
    (item) => !(item.blockId === blockId && item.lineId === lineId),
  )
  return ok(null)
}
