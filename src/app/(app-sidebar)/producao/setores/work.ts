// A lista de trabalhos dos setores no LITE (área 9 §4.16; Maicol,
// 26/11/2026): a mesma etapa do item que a Agenda de entrega mostra no ícone.

import { getItem } from '@/actions/_cruds'

export type WorkItem = {
  id: string
  status: string
  notes: string | null
  fixed: boolean
  doneAt: string | null
  doneByName: string | null
  sector: {
    id: string
    name: string
    icon: string | null
    color: string | null
  }
  scheduleId: string
  scheduledDate: string
  addScheduleTime: boolean
  quotationId: string
  reference: string
  client: string | null
  description: string | null
  item: string
  measure: string
  // Os setores que ainda faltam antes, no mesmo item
  waitingFor: string[]
  // O fluxo inteiro do item, só para ver: a etapa desta linha é a current
  flow: {
    id: string
    sector: {
      id: string
      name: string
      icon: string | null
      color: string | null
    }
    status: string
    current: boolean
  }[]
}

export type WorkList = { counts: Record<string, number>; items: WorkItem[] }

export const WORK_QUERY = 'sector-work-list'

export const fetchWork = async (params: {
  stageId?: string
  view?: 'open' | 'done'
}): Promise<WorkList> => {
  const res = await getItem({
    route: '/sale/production-stage/work-list',
    params: {
      ...(params.stageId ? { stageId: params.stageId } : {}),
      view: params.view ?? 'open',
    },
  })
  if (!res.success) throw new Error(res.message || 'Erro ao carregar')
  return res.data as WorkList
}

// Entrega e Cliente Retira são do pedido, não setores de produção
export const DELIVERY_STAGE_NAMES = ['Entrega', 'Cliente Retira']
