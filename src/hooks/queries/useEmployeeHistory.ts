import { getData } from '@/actions/_cruds'
import { EmployeeHistoryResponse } from '@/types/settings/employee'
import { useQuery } from '@tanstack/react-query'

interface UseEmployeeHistoryProps {
  employeeId: string
  enabled?: boolean
}

export function useEmployeeHistory({
  employeeId,
  enabled = true,
}: UseEmployeeHistoryProps) {
  const route = `/employee/${employeeId}/history`

  const { data, isLoading, error, refetch } = useQuery<EmployeeHistoryResponse>(
    {
      queryKey: ['employee-history', employeeId],
      enabled: enabled && !!employeeId,
      staleTime: 1000 * 60 * 5, // 5 minutes
      queryFn: async () => {
        const response = await getData({ route })

        if (!response.success) {
          throw new Error(response.message)
        }

        return response.data as EmployeeHistoryResponse
      },
    },
  )

  return {
    history: data?.history || [],
    total: data?.total || 0,
    isLoading,
    error,
    refetch,
  }
}
