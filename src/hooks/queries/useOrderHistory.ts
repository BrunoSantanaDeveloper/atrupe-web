import { getData } from '@/actions/_cruds'
import { OrderHistoryResponse } from '@/types/sales/order'
import { useQuery } from '@tanstack/react-query'

interface UseOrderHistoryProps {
  orderId: string
  enabled?: boolean
}

export function useOrderHistory({
  orderId,
  enabled = true,
}: UseOrderHistoryProps) {
  const route = `/sales/history/order/${orderId}`

  const { data, isLoading, error, refetch } = useQuery<OrderHistoryResponse>({
    queryKey: ['order-history', orderId],
    enabled: enabled && !!orderId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => {
      const response = await getData({ route })

      if (!response.success) {
        throw new Error(response.message)
      }

      return response.data as OrderHistoryResponse
    },
  })

  return {
    history: data?.history || [],
    total: data?.total || 0,
    isLoading,
    error,
    refetch,
  }
}
