'use server'

// O resultado previsto da venda (ORC-8): GET /sale/quotation/:id/result e o
// PDF identificado de /result/export (contrato, módulo 2). Tela de método:
// pede sale:quotation_result, valores e a base de custos.

// Actions
import { getItem } from '@/actions/_cruds'
import apiInstance from '@/lib/api'

export type ResultResource = {
  kind: string
  name: string
  unit: string
  quantity: number
  unitCost: number | null
  cost: number
  // A venda sugerida do recurso no retrato; nulo quando não há (a lista
  // informada pelo vendedor). A tela reparte o preço do item por ela
  sale?: number | null
  // O realizado vem do apontamento (ELITE) e do consumo (FULL): nulo até lá
  actualQuantity: number | null
  actualCost: number | null
}

export type ResultLine = {
  id: string
  // STAGE é uma etapa da composição do item; as outras, linhas acrescentadas
  kind: 'STAGE' | 'PROCESS' | 'PART' | 'LOOSE'
  name: string
  sector: string
  price: number | null
  cost: number
  resolvedAt: string | null
  resolved: ResultResource[]
}

export type QuotationResultData = {
  reference: string
  client: string | null
  // O cabeçalho da Estimativa de Custos (20/11/2026); a API antiga não manda
  seller?: string | null
  status?: string
  createdAt?: string
  approvedAt?: string | null
  revenue: number
  productionCost: number
  commission: { percent: number; value: number }
  taxes: { percent: number; value: number }
  // Despesas da venda (20/11/2026): custo da entrega, taxa da operadora das
  // parcelas e a comissão adicionada ao orçamento; a API antiga não manda
  delivery?: number
  billing?: number
  agencyCommission?: number
  result: number
  margin: number
  items: {
    itemId: string
    name: string
    total: number
    cost: number
    margin: number
    costKnown: boolean
    lines: ResultLine[]
  }[]
}

export const getQuotationResult = async ({
  quotationId,
}: {
  quotationId: string
}) => {
  const res = await getItem({ route: `/sale/quotation/${quotationId}/result` })
  return res.success
    ? { success: true, data: res.data as QuotationResultData, message: '' }
    : { success: false, data: null, message: res.message || '' }
}

// O PDF volta em base64: a action do servidor não devolve binário à tela
export const exportQuotationResult = async ({
  quotationId,
}: {
  quotationId: string
}) => {
  const api = await apiInstance()
  try {
    const res = await api.get(`/sale/quotation/${quotationId}/result/export`, {
      responseType: 'arraybuffer',
    })
    const disposition = String(res.headers['content-disposition'] || '')
    const name =
      /filename="([^"]+)"/.exec(disposition)?.[1] || 'resultado-venda.pdf'
    return {
      success: true,
      data: { name, base64: Buffer.from(res.data).toString('base64') },
      message: '',
    }
  } catch (error: unknown) {
    const digest = (error as { digest?: string })?.digest
    if (digest?.startsWith?.('NEXT_REDIRECT')) throw error
    return {
      success: false,
      data: null,
      message: 'Não foi possível exportar o resultado.',
    }
  }
}
