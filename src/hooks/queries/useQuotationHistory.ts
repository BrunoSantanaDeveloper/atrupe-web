import { getData } from '@/actions/_cruds'
import { QuotationHistoryResponse } from '@/types/sales/quotation'
import { useQuery } from '@tanstack/react-query'

interface UseQuotationHistoryProps {
  quotationId: string
  enabled?: boolean
}

export function useQuotationHistory({
  quotationId,
  enabled = true,
}: UseQuotationHistoryProps) {
  const route = `/sales/history/quotation/${quotationId}`

  const { data, isLoading, error, refetch } =
    useQuery<QuotationHistoryResponse>({
      queryKey: ['quotation-history', quotationId],
      enabled: enabled && !!quotationId,
      staleTime: 1000 * 60 * 5, // 5 minutes
      queryFn: async () => {
        const response = await getData({ route })

        if (!response.success) {
          throw new Error(response.message)
        }

        return response.data as QuotationHistoryResponse
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
