// O acesso ao assistente de IA: a chave global, o plano (ai_assistant) e a
// cota do mês. O widget e o "Montar com IA" leem daqui; a cota estourada
// (429) atualiza a leitura pelo `setQuotaExceeded`

import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAiAccessStatus } from '@/actions/ai-chat'
import type { AiQuota, AiAccessStatus } from '@/types/ai-chat'

export const AI_ACCESS_KEY = ['ai-access-status']

export function useAiAccess() {
  const queryClient = useQueryClient()
  const { data, refetch } = useQuery({
    queryKey: AI_ACCESS_KEY,
    queryFn: () => getAiAccessStatus(),
    staleTime: 60_000,
    retry: false,
  })
  const access: AiAccessStatus = data || { enabled: false, quota: null }

  // Sem o assistente no plano ou com a chave global desligada, nada aparece;
  // com a cota estourada, a tela mostra o aviso
  const visible = access.enabled || access.reason === 'QUOTA_EXCEEDED'
  const exceeded = access.reason === 'QUOTA_EXCEEDED'

  const setQuotaExceeded = useCallback(
    (quota?: AiQuota) =>
      queryClient.setQueryData<AiAccessStatus>(AI_ACCESS_KEY, (current) => ({
        enabled: false,
        reason: 'QUOTA_EXCEEDED',
        quota: quota || current?.quota || null,
      })),
    [queryClient],
  )

  return { access, visible, exceeded, refetch, setQuotaExceeded }
}

// "12 de 300 mensagens este mês · renova em 01/11"
export const quotaText = (quota: AiQuota | null) => {
  if (!quota || quota.limit === null) return null
  const renews = new Date(quota.renewsAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  })
  return `${quota.used.toLocaleString('pt-BR')} de ${quota.limit.toLocaleString('pt-BR')} mensagens este mês · renova em ${renews}`
}
