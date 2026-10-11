// Os setores da empresa para a composição (decidido em 05/10/2026): ao
// acrescentar uma etapa ou escolher o setor do processo, a lista é a do
// cadastro de setores (os ativos), e não uma lista fixa em código. Até o
// ELITE é assim; no ELITE passa a vir da configuração do gerenciador (área 8,
// nota de 03/10/2026). Quando o cadastro não responde (servidor de
// desenvolvimento sem API), valem os setores de exemplo do mock, para a tela
// não ficar sem opção

import { useMemo } from 'react'

// Actions
import { getAssemblyResources } from '@/actions/product-assembly'

// Hooks
import { useSector } from './useSector'

// Third-party
import { useQuery } from '@tanstack/react-query'

export function useCompanySectors() {
  const { data: sectors, isLoading, isError } = useSector()
  const { data: resourcesRes } = useQuery({
    staleTime: Infinity,
    queryKey: ['assembly-resources'],
    queryFn: () => getAssemblyResources(),
  })

  const names = useMemo(() => {
    const fromRegister = (sectors || [])
      .filter((sector) => sector.isActive)
      .map((sector) => sector.name)
    return fromRegister.length
      ? fromRegister
      : resourcesRes?.data?.sectors || []
  }, [sectors, resourcesRes])

  return {
    sectors: names,
    // A lista veio do cadastro (e não do exemplo)
    fromRegister: (sectors || []).some((sector) => sector.isActive),
    isLoading: isLoading && !resourcesRes,
    isError: isError && !resourcesRes,
  }
}
