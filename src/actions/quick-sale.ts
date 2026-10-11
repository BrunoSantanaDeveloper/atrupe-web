'use server'

// PROVISÓRIO: a API ainda não tem os endpoints da configuração da venda
// rápida (ALT-22). A configuração fica em memória, por empresa, mas as opções
// e os padrões vêm dos cadastros reais — séries, atendimentos e clientes —,
// para o atalho criar um orçamento de verdade.

// Libs
import { auth } from '@/lib/auth'

// Actions
import { getData, getDataOld } from '@/actions/_cruds'

// Types
import type { QuickSaleSettings } from '@/app/(app-sidebar)/configuracoes/vendas/venda-rapida/types'

type Option = { value: string; label: string }

const byCompany = new Map<string, QuickSaleSettings>()

const cashMethods: Option[] = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'cartao', label: 'Cartão' },
]

const companyKey = async () => {
  const session = await auth()
  return session?.company?.id || 'sem-empresa'
}

async function realSeries() {
  const res = await getDataOld({
    route: 'saleSeriesRoute',
    perPage: '999999',
    filters: { isActive: true },
  })

  return (res?.data || []) as {
    id: string
    code: string
    description: string
    isDefault: boolean
    isTraining: boolean
  }[]
}

async function realContactSources() {
  const res = await getData({ route: '/contact-source', perPage: '999999' })
  return (res?.success ? res.data : []) as { id: string; name: string }[]
}

async function realClients(search: string) {
  const res = await getData({
    route: '/client',
    perPage: '20',
    filters: { search },
  })
  return (res?.success ? res.data : []) as { id: string; name: string }[]
}

// O cliente de balcão: um "Consumidor", se a empresa tiver; senão o "Cliente
// Exemplo" que toda conta nova recebe; senão o primeiro cliente que houver
async function defaultClient() {
  for (const search of ['Consumidor', 'Cliente Exemplo', '']) {
    const found = await realClients(search)
    const exact = found.find((client) =>
      client.name?.toLowerCase().includes(search.toLowerCase()),
    )
    if (exact || found[0]) return exact || found[0]
  }
  return undefined
}

// Sem configuração salva, a empresa começa com um padrão que funciona: a
// série padrão, o atendimento "Venda Direta" e o cliente de balcão. Assim o
// atalho já cria o orçamento na primeira vez, e a tela de configuração só
// ajusta
async function defaults(): Promise<QuickSaleSettings> {
  const [series, sources, client] = await Promise.all([
    realSeries(),
    realContactSources(),
    defaultClient(),
  ])

  const serie =
    series.find((item) => item.isDefault && !item.isTraining) ||
    series.find((item) => item.isDefault) ||
    series[0]
  const source =
    sources.find((item) => item.name === 'Venda Direta') || sources[0]

  return {
    enabled: true,
    payment: 'CASH_ONLY',
    cashMethods: cashMethods.map((method) => method.value),
    downPaymentRequired: false,
    downPaymentPercent: 50,
    clientId: client?.id || '',
    clientName: client?.name || '',
    description: '',
    seriesId: serie?.id || '',
    serviceTypeId: source?.id || '',
    responsibleId: null,
  }
}

export const getQuickSaleSettings = async () => {
  const key = await companyKey()

  let settings = byCompany.get(key)
  if (!settings || !settings.clientId || !settings.seriesId) {
    settings = { ...(await defaults()), ...clean(settings) }
    byCompany.set(key, settings)
  }

  return { success: true, data: settings, message: '' }
}

// Mantém o que a empresa já escolheu, sem deixar um campo vazio apagar o
// padrão encontrado
const clean = (settings?: QuickSaleSettings) =>
  settings
    ? Object.fromEntries(
        Object.entries(settings).filter(
          ([, value]) => value !== '' && value !== undefined,
        ),
      )
    : {}

export const updateQuickSaleSettings = async (
  values: Partial<QuickSaleSettings>,
) => {
  // Sem cliente padrão a venda rápida não consegue criar o orçamento, que é
  // justamente o que ela existe para fazer (ALT-22)
  if (values.enabled && values.clientId !== undefined && !values.clientId) {
    return {
      success: false,
      data: null,
      message: 'Escolha o cliente padrão da venda rápida',
    }
  }

  if (
    values.downPaymentRequired &&
    (values.downPaymentPercent === undefined ||
      values.downPaymentPercent <= 0 ||
      values.downPaymentPercent > 100)
  ) {
    return {
      success: false,
      data: null,
      message: 'O sinal precisa ser um percentual entre 1% e 100%',
    }
  }

  const key = await companyKey()
  const current = byCompany.get(key) || (await defaults())
  const settings = { ...current, ...values }
  byCompany.set(key, settings)

  return { success: true, data: settings, message: '' }
}

// Opções vindas dos cadastros reais da empresa
export const getQuickSaleOptions = async () => {
  const [series, sources] = await Promise.all([
    realSeries(),
    realContactSources(),
  ])

  return {
    success: true,
    data: {
      series: series.map((item) => ({
        value: item.id,
        label: `${item.code} - ${item.description}`,
      })),
      serviceTypes: sources.map((item) => ({
        value: item.id,
        label: item.name,
      })),
      cashMethods,
      users: [{ value: 'none', label: 'Sem responsável' }],
    },
    message: '',
  }
}
