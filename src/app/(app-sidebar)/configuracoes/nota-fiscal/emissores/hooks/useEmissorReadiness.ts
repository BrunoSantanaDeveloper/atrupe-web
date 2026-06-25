import { useQuery } from '@tanstack/react-query'

import { getData } from '@/actions/_cruds'

import type { FiscalEnv, ReadinessResult } from '../lib/fiscal-readiness'

/**
 * Consulta o readiness de um emissor para um ambiente, sob demanda.
 *
 * Deve permanecer desabilitada por padrão (diagnóstico/wizard ligam `enabled`
 * quando o usuário abre a tela), evitando uma consulta por card na listagem.
 */
export function useEmissorReadiness(
  emissorId: string,
  environment: FiscalEnv,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ['emissor-readiness', emissorId, environment],
    enabled: enabled && !!emissorId,
    staleTime: 30_000,
    queryFn: async () => {
      const res = await getData({
        route: `/fiscal/emissores/${emissorId}/environments/${environment}/readiness`,
      })
      if (!res.success) {
        throw new Error(
          res.message || 'Falha ao consultar prontidão do emissor',
        )
      }
      return res.data as ReadinessResult
    },
  })
}
