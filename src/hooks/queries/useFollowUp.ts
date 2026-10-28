// Acompanhamento comercial (CRM fase 2): os totais da aba Aguardando e do
// contador do menu, e a configuração (modelos de mensagem). Os totais mudam
// com o dia e com cada contato registrado: cache curto, invalidado por quem
// grava ('follow-up-summary').

import { useQuery } from '@tanstack/react-query'
import { getFollowUpSettings, getFollowUpSummary } from '@/actions/follow-up'

export const FOLLOW_UP_SUMMARY_KEY = 'follow-up-summary'
export const FOLLOW_UP_SETTINGS_KEY = 'follow-up-settings'

export function useFollowUpSummary(enabled = true) {
  return useQuery({
    queryKey: [FOLLOW_UP_SUMMARY_KEY],
    queryFn: () => getFollowUpSummary(),
    staleTime: 5 * 60 * 1000,
    enabled,
    select: (res) => (res.success ? res.data : null),
  })
}

export function useFollowUpSettings() {
  return useQuery({
    queryKey: [FOLLOW_UP_SETTINGS_KEY],
    queryFn: () => getFollowUpSettings(),
    staleTime: Infinity,
    select: (res) => (res.success ? res.data : null),
  })
}
