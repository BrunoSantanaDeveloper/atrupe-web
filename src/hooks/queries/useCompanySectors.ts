// Os setores da empresa para a composição (decidido em 05/10/2026): ao
// acrescentar uma etapa ou escolher o setor do processo, a lista é a do
// cadastro de setores (os ativos), e não uma lista fixa em código. Até o
// ELITE é assim; no ELITE passa a vir da configuração do gerenciador (área 8,
// nota de 03/10/2026)

import { useMemo } from 'react'

// Hooks
import { useSector } from './useSector'

export function useCompanySectors() {
  const { data: sectors, isLoading, isError } = useSector()

  const names = useMemo(
    () =>
      (sectors || [])
        .filter((sector) => sector.isActive)
        .map((sector) => sector.name),
    [sectors],
  )

  return { sectors: names, isLoading, isError }
}
