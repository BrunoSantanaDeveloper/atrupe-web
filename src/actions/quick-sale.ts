'use server'

// A configuração da venda rápida (VR-4, VR-5, FC-17, Fase 7.3) pela API:
// GET/PUT /sale/quick-sale/settings. Sem nada salvo, a API devolve os
// padrões (série padrão, atendimento "Venda Direta", cliente de balcão). As
// opções dos selects vêm dos cadastros: séries, atendimentos e os contatos
// do cliente padrão (o responsável).

// Actions
import { getData, getDataOld, getItem, putItemNew } from '@/actions/_cruds'

// Types
import type { QuickSaleSettings } from '@/app/(app-sidebar)/configuracoes/vendas/venda-rapida/types'

type ApiResult = {
  success: boolean
  // O corpo de cada rota é tipado onde é lido
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
  message?: string
}

type Option = { value: string; label: string }

const cashMethods: Option[] = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'cartao', label: 'Cartão' },
]

const EMPTY: QuickSaleSettings = {
  payment: 'CASH_ONLY',
  cashMethods: [],
  downPaymentRequired: false,
  downPaymentPercent: 0,
  enabled: false,
  clientId: '',
  clientName: '',
  description: '',
  seriesId: '',
  serviceTypeId: '',
  responsibleId: null,
}

export const getQuickSaleSettings = async () => {
  const res: ApiResult = await getItem({ route: '/sale/quick-sale/settings' })
  if (!res.success) {
    return { success: false, data: EMPTY, message: res.message || '' }
  }
  return { success: true, data: res.data as QuickSaleSettings, message: '' }
}

// A tela sempre envia o objeto inteiro (o nome do cliente é só da tela)
export const updateQuickSaleSettings = async (values: QuickSaleSettings) => {
  const res: ApiResult = await putItemNew({
    route: '/sale/quick-sale/settings',
    data: {
      enabled: values.enabled,
      payment: values.payment,
      cashMethods: values.cashMethods,
      downPaymentRequired: values.downPaymentRequired,
      downPaymentPercent: values.downPaymentPercent,
      clientId: values.clientId || null,
      description: values.description,
      seriesId: values.seriesId || null,
      serviceTypeId: values.serviceTypeId || null,
      responsibleId: values.responsibleId || null,
    },
  })
  if (!res.success) {
    return { success: false, data: null, message: res.message || '' }
  }
  return { success: true, data: res.data as QuickSaleSettings, message: '' }
}

// Opções dos cadastros da empresa; o responsável é um contato do cliente
// padrão, ou nenhum (VR-2)
export const getQuickSaleOptions = async (clientId?: string) => {
  const [series, sources, contacts] = await Promise.all([
    getDataOld({
      route: 'saleSeriesRoute',
      perPage: '999999',
      filters: { isActive: true },
    }),
    getData({ route: '/contact-source', perPage: '999999' }),
    clientId
      ? (getItem({
          route: '/contact',
          params: { clientId, page: '1', limit: '100' },
        }) as Promise<ApiResult>)
      : Promise.resolve({ success: true, data: [] } as ApiResult),
  ])
  const seriesRows = (series?.data || []) as {
    id: string
    code: string
    description: string
  }[]
  const sourceRows = (sources?.success ? sources.data : []) as {
    id: string
    name: string
  }[]
  const contactRows = (contacts.data?.data ?? contacts.data ?? []) as {
    id: string
    name: string
  }[]

  return {
    success: true,
    data: {
      series: seriesRows.map((item) => ({
        value: item.id,
        label: `${item.code} - ${item.description}`,
      })),
      serviceTypes: sourceRows.map((item) => ({
        value: item.id,
        label: item.name,
      })),
      cashMethods,
      users: [
        { value: 'none', label: 'Sem responsável' },
        ...contactRows.map((item) => ({ value: item.id, label: item.name })),
      ],
    },
    message: '',
  }
}
