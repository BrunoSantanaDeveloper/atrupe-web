import { getData } from '@/actions/_cruds'
import type { SessionUser, CompanyStatistics } from '@/types/admin/sessions'
import { useQuery } from '@tanstack/react-query'

interface UseActiveSessionsOptions {
  companyId?: string
  minutesThreshold?: number
  enabled?: boolean
}

export function useActiveSessions(options: UseActiveSessionsOptions = {}) {
  const { companyId, minutesThreshold, enabled = true } = options

  const route = '/activity-monitor/online'

  const filters: { [key: string]: string | undefined } = {}
  if (companyId) filters.companyId = companyId
  if (minutesThreshold) filters.minutesThreshold = minutesThreshold.toString()

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['active-sessions', companyId, minutesThreshold],
    queryFn: async () => {
      const response = await getData({ route, filters })
      if (!response.success) {
        throw new Error(response.message || 'Erro ao buscar sessões ativas')
      }
      return response.data as SessionUser[]
    },
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchInterval: 1000 * 30, // Auto-refresh every 30 seconds
    enabled,
  })

  return {
    sessions: data || [],
    isLoading,
    isRefetching,
    error,
    refetch,
  }
}

interface UseCompanyStatisticsOptions {
  companyId: string
  days?: number
  enabled?: boolean
}

export function useCompanyStatistics(options: UseCompanyStatisticsOptions) {
  const { companyId, days = 30, enabled = true } = options

  const route = `/activity-monitor/company/${companyId}/statistics?days=${days}`

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['company-statistics', companyId, days],
    queryFn: async () => {
      const response = await getData({ route })
      if (!response.success) {
        throw new Error(response.message || 'Erro ao buscar estatísticas')
      }
      return response.data as CompanyStatistics
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: enabled && !!companyId,
  })

  return {
    statistics: data,
    isLoading,
    error,
    refetch,
  }
}
