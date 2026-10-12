'use server'

// A cor do setor vem do próprio setor (`GET /sector`, campo `color`). Esta
// action devolve o mapa { id | nome normalizado → cor } que o hook
// `useSectorColor` usa: a composição e a produção ainda só conhecem o nome do
// setor. Setor sem cor escolhida não entra no mapa: vale o padrão do ícone
// (src/consts/sectors.ts). A cor é gravada pelo cadastro de setores, no
// próprio `PATCH /sector/:id`.

import { getItem } from '@/actions/_cruds'
import { normalizeSectorName } from '@/lib/sector-color'

type SectorWithColor = {
  id?: string | null
  name?: string | null
  color?: string | null
}

export const getSectorColors = async () => {
  const res = await getItem({
    route: '/sector',
    params: { page: '1', limit: '100' },
  })
  if (!res.success) {
    return {
      success: false,
      data: {} as Record<string, string>,
      message: res.message,
    }
  }

  const map: Record<string, string> = {}
  const sectors: SectorWithColor[] = res.data?.data ?? []
  for (const sector of sectors) {
    if (!sector?.color) continue
    if (sector.id) map[sector.id] = sector.color
    if (sector.name) map[normalizeSectorName(sector.name)] = sector.color
  }
  return { success: true, data: map, message: '' }
}
