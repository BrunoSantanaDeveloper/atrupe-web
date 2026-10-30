'use server'

// Papéis (GR-0): as rotas /material da API no modo papel (`?paper=true`).
// No LITE, com `paper_register` e sem a base de custos, a API aceita só o
// papel: nome, setor, gramatura, folha e área útil, sem custo nem preço. No
// PRO as mesmas rotas servem, e o papel aparece também em Materiais.

// Types
import type {
  Paper,
  PaperValues,
} from '@/app/(app-sidebar)/cadastros/papeis/types'

// Actions
import { getItem, createItemNew, updateItemNew } from '@/actions/_cruds'

const PAGE_SIZE = 100
const MAX_PAGES = 30

type ApiPaper = Omit<Paper, 'sheetWidth' | 'sheetHeight'> & {
  sheetWidth?: number | null
  sheetHeight?: number | null
}

const toPaper = (paper: ApiPaper): Paper => ({
  id: paper.id,
  code: paper.code,
  name: paper.name,
  sectorId: paper.sectorId,
  sector: paper.sector,
  grammage: paper.grammage ?? null,
  sheetFormat: paper.sheetFormat ?? null,
  sheetWidth: paper.sheetWidth ?? null,
  sheetHeight: paper.sheetHeight ?? null,
  usableWidth: paper.usableWidth ?? null,
  usableHeight: paper.usableHeight ?? null,
  active: paper.active,
})

export const getPapers = async ({
  filters,
}: {
  filters?: { [key: string]: string | undefined }
}) => {
  const search = filters?.search?.trim()
  const params = {
    paper: 'true',
    limit: String(PAGE_SIZE),
    active: filters?.status === 'inativos' ? 'false' : 'true',
    ...(search ? { search } : {}),
  }

  const data: Paper[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await getItem({
      route: '/material',
      params: { ...params, page: String(page) },
    })
    if (!res.success) {
      return {
        success: false,
        data: [] as Paper[],
        message: res.message,
        planError: res.planError,
      }
    }
    data.push(...((res.data?.data || []) as ApiPaper[]).map(toPaper))
    if (page >= (res.data?.lastPage || 1)) break
  }

  return { success: true, data, message: '' }
}

// Nos formatos padrão a folha é da API; só o personalizado manda a medida
const body = (values: PaperValues) => ({
  name: values.name,
  sectorId: values.sectorId,
  grammage: values.grammage,
  sheetFormat: values.sheetFormat,
  ...(values.sheetFormat === 'CUSTOM'
    ? { sheetWidth: values.sheetWidth, sheetHeight: values.sheetHeight }
    : {}),
  usableWidth: values.usableWidth,
  usableHeight: values.usableHeight,
  ...(values.active !== undefined ? { active: values.active } : {}),
})

export const createPaper = async (values: PaperValues) => {
  const res = await createItemNew({ route: '/material', data: body(values) })
  if (!res.success) {
    return { success: false, data: null, message: res.message }
  }
  return { success: true, data: toPaper(res.data), message: '' }
}

export const updatePaper = async ({
  id,
  ...values
}: PaperValues & { id: string }) => {
  const res = await updateItemNew({
    route: `/material/${id}`,
    data: body(values),
  })
  if (!res.success) {
    return { success: false, data: null, message: res.message }
  }
  return { success: true, data: toPaper(res.data), message: '' }
}
