'use server'

// Precificação (recurso do PRO, módulo 4): as rotas /pricing da API. Tudo ali
// é valor: sem values:values:view a API recusa (403), e as páginas já pedem a
// permissão. Dinheiro em centavos; parâmetros e lucro em décimos de ponto
// (60 = 6,0%); margem em % com uma casa.
//
// O custo nunca é gravado aqui (DC-6): vem da origem (base de custos,
// patrimônio, material, composição). Daqui sai o preço de mão de obra e de
// máquinas; o do material é gravado no cadastro (materials.ts ›
// updateMaterialPrice) e o do produto, no cadastro do produto.

// Types
import type {
  PriceRule,
  PricingItem,
  PricingGroup,
  PricingStatus,
  PricingSummary,
  PricingItemsPage,
  PricingParameters,
  PricingGroupSummary,
  SuggestedPriceItem,
} from '@/app/(app-sidebar)/precificacao/types'

// Actions
import {
  getItem,
  putItemNew,
  createItemNew,
  updateItemNew,
} from '@/actions/_cruds'

const GROUPS: PricingGroup[] = ['labor', 'machines', 'materials', 'products']
const STATUSES = ['todos', 'PRICED', 'PENDING', 'BELOW_COST', 'NO_COST']

// A lista de cada aba vem uma página por vez: a tela pagina pela URL
const PAGE_SIZE = 50
// A procura de um item só usa o teto da API, para andar menos páginas
const MAX_PAGE_SIZE = 100
const MAX_PAGES = 20

type Result<T> = { success: boolean; data: T; message: string }
type ApiResult = {
  success: boolean
  // O corpo de cada rota é tipado onde é lido
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
  message?: string
}

const ok = <T>(data: T): Result<T> => ({ success: true, data, message: '' })
const fail = <T>(res: ApiResult, data: T): Result<T> => ({
  success: false,
  data,
  message: res.message || 'Não foi possível concluir.',
})
const refuse = <T>(message: string, data: T) =>
  fail({ success: false, message }, data)

// O id entra no caminho da rota e tem ":" (setup:<id>, group:<id>): nada de
// "/" ou "?" vindo da tela
const seg = (id: string) => encodeURIComponent(id)

// Sem custo ou sem preço o valor vem nulo, e a tela mostra `-`, nunca R$ 0,00
const numOrNull = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null
const num = (value: unknown) => numOrNull(value) ?? 0
const textOrNull = (value: unknown) =>
  typeof value === 'string' && value ? value : null

// Centavos e décimos de ponto vão inteiros: a API recusa fração
const int = (value: unknown) => Math.round(Number(value))

/* --------------------------------------------------------------------------
 * Formato da API para o da tela: só os campos que a tela lê
 * ------------------------------------------------------------------------ */

type ApiRow = { [key: string]: unknown }
const rowsOf = (value: unknown): ApiRow[] =>
  Array.isArray(value) ? (value as ApiRow[]) : []

const toParameters = (body: ApiRow): PricingParameters => ({
  taxation: num(body.taxation),
  commission: num(body.commission),
  financialCost: num(body.financialCost),
  desiredMargin: num(body.desiredMargin),
  // Nulo quando encargos e lucro somam 100% ou mais: a tela avisa
  markup: numOrNull(body.markup),
})

const toGroupSummary = (group: ApiRow): PricingGroupSummary => ({
  group: group.group as PricingGroup,
  total: num(group.total),
  priced: num(group.priced),
  pending: num(group.pending),
  noCost: num(group.noCost),
  belowCost: num(group.belowCost),
})

const toItem = (item: ApiRow): PricingItem => ({
  id: String(item.id ?? ''),
  name: String(item.name ?? ''),
  code: textOrNull(item.code),
  sector: textOrNull(item.sector),
  unit: String(item.unit ?? ''),
  cost: numOrNull(item.cost),
  costUpdatedAt: textOrNull(item.costUpdatedAt),
  rule: item.rule === 'VARIABLE' ? 'VARIABLE' : 'FIXED',
  price: numOrNull(item.price),
  profit: numOrNull(item.profit),
  margin: numOrNull(item.margin),
  status: item.status as PricingStatus,
})

/* --------------------------------------------------------------------------
 * Resumo e parâmetros (PR-4)
 * ------------------------------------------------------------------------ */

export const getPricingSummary = async () => {
  const res: ApiResult = await getItem({ route: '/pricing/summary' })
  if (!res.success) return fail<PricingSummary | null>(res, null)
  return ok<PricingSummary | null>({
    referenceMonth: String(res.data?.referenceMonth ?? ''),
    parameters: toParameters((res.data?.parameters ?? {}) as ApiRow),
    groups: rowsOf(res.data?.groups)
      .filter((group) => GROUPS.includes(group.group as PricingGroup))
      .map(toGroupSummary),
  })
}

// Só os parâmetros, que é o que o modal de preço usa na simulação. A rota
// também aceita quem edita produto: o modal abre do cadastro de produtos e do
// de materiais, onde o Resumo (cost:pricing:view) seria recusado
export const getPricingParameters = async () => {
  const res: ApiResult = await getItem({ route: '/pricing/parameters' })
  if (!res.success) return fail<PricingParameters | null>(res, null)
  return ok<PricingParameters | null>(toParameters(res.data ?? {}))
}

// A soma dos quatro precisa ficar abaixo de 100%: a API recusa. Gravar refaz
// o preço de todo item de regra variável, preservando o lucro de cada um
export const updatePricingParameters = async (
  values: Omit<PricingParameters, 'markup'>,
) => {
  const res: ApiResult = await putItemNew({
    route: '/pricing/parameters',
    // Só os quatro campos do corpo: o markup é calculado pela API
    data: {
      taxation: int(values?.taxation),
      commission: int(values?.commission),
      financialCost: int(values?.financialCost),
      desiredMargin: int(values?.desiredMargin),
    },
  })
  if (!res.success) return fail<PricingParameters | null>(res, null)
  return ok<PricingParameters | null>(toParameters(res.data ?? {}))
}

/* --------------------------------------------------------------------------
 * Itens de um grupo: custo, regra, preço, margem e situação
 * ------------------------------------------------------------------------ */

// Uma página por vez. Os filtros são os da URL da tela; o que a API não
// conhece fica de fora
export const getPricingItems = async ({
  group,
  filters,
}: {
  group: PricingGroup
  filters?: { [key: string]: string | undefined }
}) => {
  const empty: PricingItemsPage = {
    referenceMonth: '',
    items: [],
    page: 1,
    lastPage: 1,
    total: 0,
  }
  if (!GROUPS.includes(group)) return refuse('Grupo inválido', empty)

  const status = STATUSES.includes(filters?.status ?? '')
    ? (filters?.status as string)
    : 'todos'
  const search = filters?.search?.trim().slice(0, 120)
  const page = Math.max(Math.floor(Number(filters?.page) || 1), 1)

  const res: ApiResult = await getItem({
    route: '/pricing/item',
    params: {
      group,
      status,
      ...(search ? { search } : {}),
      page: String(page),
      limit: String(PAGE_SIZE),
    },
  })
  if (!res.success) return fail(res, empty)
  return ok<PricingItemsPage>({
    referenceMonth: String(res.data?.referenceMonth ?? ''),
    items: rowsOf(res.data?.data).map(toItem),
    page: num(res.data?.page) || 1,
    lastPage: num(res.data?.lastPage) || 1,
    total: num(res.data?.total),
  })
}

// Um item só, para abrir o modal de preço fora da lista (a aba Mão de obra
// da base de custos). A API não tem a leitura por id: a busca pelo nome
// encurta a lista, e o id decide
export const getPricingItem = async ({
  group,
  id,
  name,
}: {
  group: PricingGroup
  id: string
  name?: string
}) => {
  if (!GROUPS.includes(group)) {
    return refuse<PricingItem | null>('Grupo inválido', null)
  }
  const search = name?.trim().slice(0, 120)

  for (let page = 1; page <= MAX_PAGES; page++) {
    const res: ApiResult = await getItem({
      route: '/pricing/item',
      params: {
        group,
        ...(search ? { search } : {}),
        page: String(page),
        limit: String(MAX_PAGE_SIZE),
      },
    })
    if (!res.success) return fail<PricingItem | null>(res, null)
    const found = rowsOf(res.data?.data).find((item) => item.id === id)
    if (found) return ok<PricingItem | null>(toItem(found))
    if (page >= (res.data?.lastPage ?? 1)) break
  }
  return refuse<PricingItem | null>('Item não encontrado', null)
}

// Grava a regra e o preço de mão de obra e de máquinas. No fixo vai o preço;
// no variável vai o lucro, e o preço enviado só confere: quem calcula é a
// API, que recusa a diferença de mais de 1 centavo ("O preço mudou; abra o
// item de novo"). Material e produto são recusados aqui: cada um tem o seu
// cadastro
export const updateItemPrice = async ({
  group,
  id,
  rule,
  price,
  profit,
}: {
  group: PricingGroup
  id: string
  rule: PriceRule
  price: number
  // Só no variável, em décimos de ponto (300 = 30,0%)
  profit?: number
}) => {
  if (!id) return refuse<PricingItem | null>('Item não encontrado', null)

  const priceField = Number.isFinite(price) ? { price: int(price) } : {}
  const res: ApiResult = await updateItemNew({
    route: `/pricing/item/${seg(id)}`,
    // Só os campos de cada regra: o lucro não vai no preço fixo
    data:
      rule === 'VARIABLE'
        ? {
            group,
            rule,
            ...(typeof profit === 'number' ? { profit: int(profit) } : {}),
            ...priceField,
          }
        : { group, rule, ...priceField },
  })
  if (!res.success) return fail<PricingItem | null>(res, null)
  return ok<PricingItem | null>(toItem(res.data ?? {}))
}

// Aplicar o preço sugerido a vários itens (CP-7, PO 14/10/2026): sem
// `confirmed`, a API só devolve a prévia; com ele, grava. Produto pelo preço
// da composição; mão de obra e máquina por custo × markup, como preço
// variável pelo lucro desejado; material também, gravado no cadastro dele
// (28/10/2026, patch 18 do backend)
export const applySuggestedPrices = async ({
  group,
  ids,
  confirmed,
}: {
  group: PricingGroup
  ids: string[]
  confirmed: boolean
}) => {
  type Applied = { items: SuggestedPriceItem[]; applied: number }
  const empty: Applied = { items: [], applied: 0 }
  const res: ApiResult = await createItemNew({
    route: '/pricing/item/apply-suggested',
    data: { group, ids, confirmed },
  })
  if (!res.success) return fail(res, empty)
  return ok<Applied>({
    items: rowsOf(res.data?.items).map((item) => ({
      id: String(item.id ?? ''),
      name: textOrNull(item.name),
      cost: numOrNull(item.cost),
      price: numOrNull(item.price),
      suggestedPrice: numOrNull(item.suggestedPrice),
      marginBefore: numOrNull(item.marginBefore),
      marginAfter: numOrNull(item.marginAfter),
      ...(textOrNull(item.skipped)
        ? { skipped: textOrNull(item.skipped) as string }
        : {}),
    })),
    applied: num(res.data?.applied),
  })
}
