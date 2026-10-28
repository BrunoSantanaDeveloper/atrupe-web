// Types
import type {
  FormulaKey,
  ResourceKind,
  DimensionRule,
} from '@/app/(app-sidebar)/configuracoes/produtos/processos/types'
import type { AfterBase } from '@/app/(app-sidebar)/configuracoes/produtos/[id]/composicao/assembly'

export const resourceKindObj: { [key in ResourceKind]: string } = {
  MACHINE: 'Máquina',
  MATERIAL: 'Material',
  LABOR: 'Mão de obra',
  OUTSOURCED: 'Terceirizado',
}

export const resourceKindOptions = (
  Object.keys(resourceKindObj) as ResourceKind[]
).map((kind) => ({ value: kind, label: resourceKindObj[kind] }))

// Nomes no lugar dos códigos de fórmula do legado (D3 §9.2)
export const formulaObj: {
  [key in FormulaKey]: { label: string; help: string }
} = {
  FIXED: {
    label: 'Valor fixo',
    help: 'Usa a quantidade informada, sem depender da medida do item.',
  },
  SELLER: {
    label: 'Definido pelo vendedor',
    help: 'O vendedor informa a quantidade no orçamento.',
  },
  PER_AREA: {
    label: 'Por metro quadrado',
    help: 'Consumo × área do item × quantidade.',
  },
  PER_UNIT: {
    label: 'Por unidade',
    help: 'Consumo × quantidade do item.',
  },
  PER_PERIMETER: {
    label: 'Por perímetro',
    help: 'Consumo × perímetro do item × quantidade.',
  },
  PER_WIDTH: {
    label: 'Por largura',
    help: 'Consumo × largura do item × quantidade.',
  },
  PER_HEIGHT: {
    label: 'Por altura',
    help: 'Consumo × altura do item × quantidade.',
  },
  PER_EXTRA: {
    label: 'Por {campo}',
    help: 'Consumo × valor de um {campo} × quantidade.',
  },
  // O tempo é da linha de mão de obra: o consumo é o tempo padrão e o
  // vendedor pode mudar no orçamento (03/10/2026, sai o "campo tempo")
  PER_TIME: {
    label: 'Tempo informado pelo vendedor',
    help: 'O vendedor informa o tempo no orçamento; o consumo é o tempo padrão. × quantidade do item.',
  },
  // A conta do ilhós: perímetro ÷ espaçamento = quantas peças (CP-14)
  PER_PERIMETER_DIV_EXTRA: {
    label: 'Por perímetro ÷ {campo}',
    help: 'Perímetro do item ÷ valor do {campo} × consumo × quantidade. Ex.: ilhoses a cada 50 cm.',
  },
  TIME_TIMES_EXTRA: {
    label: 'Tempo informado × {campo}',
    help: 'O tempo informado pelo vendedor × valor de {campo}. Não multiplica pela quantidade.',
  },
  EQUAL_TIME: {
    label: 'Tempo informado, uma vez',
    help: 'O tempo informado pelo vendedor, sem multiplicar pela quantidade.',
  },
  PER_WIDTH_EXTRA: {
    label: 'Por largura × {campo}',
    help: 'Consumo × largura × {campo} × quantidade.',
  },
  PER_HEIGHT_EXTRA: {
    label: 'Por altura × {campo}',
    help: 'Consumo × altura × {campo} × quantidade.',
  },
  EXTRA_ONLY: {
    label: 'Por {campo}, uma vez',
    help: 'Consumo × {campo}. Não multiplica pela quantidade.',
  },
  PER_AREA_DIV_EXTRA: {
    label: 'Por m² ÷ {campo}',
    help: 'Consumo × área × quantidade ÷ {campo}. Ex.: peças que cabem numa chapa.',
  },
  PER_PERIMETER_EXTRA: {
    label: 'Por perímetro × {campo}',
    help: 'Consumo × perímetro × quantidade × {campo}.',
  },
  DIV_EXTRA: {
    label: 'Dividido por {campo}',
    help: 'Consumo ÷ {campo}, uma vez.',
  },
  AREA_EXTRA: {
    label: 'Por m² × {campo}, uma vez',
    help: 'Consumo × área × {campo}. Não multiplica pela quantidade.',
  },
  PER_AREA_EXTRA: {
    label: 'Por m² × {campo}',
    help: 'Consumo × área × quantidade × {campo}.',
  },
  SHEET_YIELD: {
    label: 'Por aproveitamento de folha',
    help: 'Quantas peças cabem na folha, nas duas posições, e quantas folhas são precisas. A folha tem a medida do material.',
  },
  // A conta escrita no produto (IP-2): o seletor mostra o nome dela
  CUSTOM: {
    label: 'Fórmula do produto',
    help: 'Consumo × o resultado da fórmula escrita neste produto.',
  },
}

// O "campo extra" não existe mais como conceito (03/10/2026): o tipo de
// cálculo que lê um valor informado no orçamento nomeia o campo do produto
// ("Por perímetro ÷ distância entre ilhoses"). Sem campo criado, esses tipos
// não aparecem
export const FIELD_TOKEN = '{campo}'

export const formulaUsesField = (key: FormulaKey) =>
  formulaObj[key].label.includes(FIELD_TOKEN) ||
  formulaObj[key].help.includes(FIELD_TOKEN)

const withField = (text: string, fieldName?: string | null) =>
  text.split(FIELD_TOKEN).join(fieldName || 'campo')

export const formulaLabel = (key: FormulaKey, fieldName?: string | null) =>
  withField(formulaObj[key].label, fieldName)

export const formulaHelp = (key: FormulaKey, fieldName?: string | null) =>
  withField(formulaObj[key].help, fieldName)

// O valor do seletor: a fórmula e, quando ela lê um campo, qual campo; na
// fórmula do produto, qual fórmula
export const formulaChoiceValue = (
  key: FormulaKey,
  fieldName?: string | null,
  formulaId?: string | null,
) =>
  key === 'CUSTOM'
    ? `CUSTOM::${formulaId || ''}`
    : fieldName
      ? `${key}::${fieldName}`
      : key

export const parseFormulaChoice = (
  value: string,
): { formula: FormulaKey; fieldName?: string; formulaId?: string } => {
  const [key, ...rest] = value.split('::')
  const suffix = rest.length ? rest.join('::') : undefined
  if (key === 'CUSTOM') return { formula: 'CUSTOM', formulaId: suffix }
  return { formula: key as FormulaKey, fieldName: suffix }
}

// As fórmulas pela medida, para cada campo do produto as que leem campo e,
// por fim, as fórmulas escritas no produto
export const formulaOptionsFor = (
  fields: { name: string }[],
  formulas: { id: string; name: string }[] = [],
) => {
  const keys = Object.keys(formulaObj) as FormulaKey[]
  const plain = keys
    .filter((key) => key !== 'CUSTOM' && !formulaUsesField(key))
    .map((key) => ({ value: key, label: formulaObj[key].label }))
  const byField = fields.flatMap((field) =>
    keys.filter(formulaUsesField).map((key) => ({
      value: formulaChoiceValue(key, field.name),
      label: formulaLabel(key, field.name),
    })),
  )
  const custom = formulas.map((formula) => ({
    value: formulaChoiceValue('CUSTOM', null, formula.id),
    label: `Fórmula · ${formula.name}`,
  }))
  return [...plain, ...byField, ...custom]
}

export const dimensionRuleObj: { [key in DimensionRule]: string } = {
  NONE: 'Sem dimensão',
  FREE_SIZE: 'Largura e altura livres',
  FREE_AREA: 'Área livre',
  FIXED_SIZE: 'Dimensão fixa',
  // "Base" é o que recebe o acabamento; o legado chamava de "item pai"
  SAME_AS_PARENT: 'Mesma medida da base',
}

export const dimensionRuleOptions = (
  Object.keys(dimensionRuleObj) as DimensionRule[]
).map((rule) => ({ value: rule, label: dimensionRuleObj[rule] }))

// O que o processo prefere quando entra depois de outra etapa (03/10/2026).
// "Acabamento" e "serviço principal" são exemplos para entender a escolha,
// não um tipo: base ou acabamento é a posição no produto (05/10/2026)
export const afterBaseObj: {
  [key in AfterBase]: { label: string; badge: string; help: string }
} = {
  // Medida própria vem primeiro: é a regra de quem começa um produto (28/10/2026)
  OWN: {
    label: 'Medida própria',
    badge: 'Medida própria',
    help: 'Como um serviço principal ou uma instalação: pede medida e quantidade ao vendedor, mesmo vindo depois de outra etapa.',
  },
  // Era "Acompanha a base", que não se explicava a quem ouvia pela primeira vez
  INHERIT: {
    label: 'Mesma medida da etapa anterior',
    badge: 'Mesma medida',
    help: 'Como um acabamento (bainha, ilhós, laminação): não pede medida ao vendedor; usa a medida e a quantidade da etapa anterior.',
  },
}
export const afterBaseOptions = (Object.keys(afterBaseObj) as AfterBase[]).map(
  (key) => ({ value: key, label: afterBaseObj[key].label }),
)
