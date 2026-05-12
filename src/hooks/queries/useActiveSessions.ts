import { getData } from '@/actions/_cruds'
import type {
  AccessSessionDetails,
  AccessSessionsResponse,
  AccessSummary,
  SessionUser,
  CompanyStatistics,
} from '@/types/admin/sessions'
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

  const route = `/activity-monitor/statistics/${companyId}`

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['company-statistics', companyId, days],
    queryFn: async () => {
      const response = await getData({
        route,
        filters: { days: days.toString() },
      })
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

interface UseAccessSessionsOptions {
  page?: number
  limit?: number
  search?: string
  companyId?: string
  userId?: string
  method?: string
  status?: string
  startDate?: string
  endDate?: string
}

export function useAccessSessions(options: UseAccessSessionsOptions = {}) {
  const filters: { [key: string]: string | undefined } = {
    page: options.page?.toString(),
    limit: options.limit?.toString(),
    search: options.search,
    companyId: options.companyId,
    userId: options.userId,
    method: options.method,
    status: options.status,
    startDate: options.startDate,
    endDate: options.endDate,
  }

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['access-sessions', filters],
    queryFn: async () => {
      const response = await getData({
        route: '/activity-monitor/access-sessions',
        filters,
      })
      if (!response.success) {
        throw new Error(response.message || 'Erro ao buscar acessos')
      }
      return response.data as AccessSessionsResponse
    },
    staleTime: 1000 * 60,
  })

  return {
    accessSessions: data?.data || [],
    total: data?.total || 0,
    page: data?.page || options.page || 1,
    lastPage: data?.lastPage || 1,
    isLoading,
    isRefetching,
    error,
    refetch,
  }
}

export function useAccessSummary(days = 30, companyId?: string) {
  const filters: { [key: string]: string | undefined } = {
    days: days.toString(),
    companyId,
  }

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['access-summary', days, companyId],
    queryFn: async () => {
      const response = await getData({
        route: '/activity-monitor/access-summary',
        filters,
      })
      if (!response.success) {
        throw new Error(response.message || 'Erro ao buscar resumo de acessos')
      }
      return response.data as AccessSummary
    },
    staleTime: 1000 * 60 * 5,
  })

  return {
    summary: data,
    isLoading,
    error,
    refetch,
  }
}

export function useAccessSessionDetails(
  sessionId?: string,
  options: { limit?: number; offset?: number; enabled?: boolean } = {},
) {
  const { limit = 20, offset = 0, enabled = true } = options

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['access-session-details', sessionId, limit, offset],
    queryFn: async () => {
      const response = await getData({
        route: `/activity-monitor/sessions/${sessionId}`,
        filters: { limit: String(limit), offset: String(offset) },
      })
      if (!response.success) {
        throw new Error(response.message || 'Erro ao buscar detalhe da sessao')
      }
      return response.data as AccessSessionDetails
    },
    enabled: enabled && !!sessionId,
    staleTime: 1000 * 60,
  })

  return {
    details: data,
    isLoading,
    isRefetching,
    error,
    refetch,
  }
}
