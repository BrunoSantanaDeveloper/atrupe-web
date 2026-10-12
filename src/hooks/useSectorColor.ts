'use client'

// A cor do setor para componentes: lê as cores escolhidas no cadastro de
// setores (campo `color` de `/sector`) uma vez e devolve a função
// `sectorColor` já com elas. Setor sem cor escolhida fica com o padrão.

import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getSectorColors } from '@/actions/sector-colors'
import { sectorColor, type SectorRef } from '@/lib/sector-color'

export const SECTOR_COLORS_QUERY_KEY = 'sector-colors'

export function useSectorColor() {
  const { data } = useQuery({
    queryKey: [SECTOR_COLORS_QUERY_KEY],
    queryFn: () => getSectorColors(),
    staleTime: Infinity,
  })
  const chosen = data?.data || {}
  return useCallback(
    (sector: SectorRef | string) => sectorColor(sector, chosen),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(chosen)],
  )
}
