import { getData } from '@/actions/_cruds'
import { TransactionHistoryResponse } from '@/types/financial/financialFlow'
import { useQuery } from '@tanstack/react-query'

interface UseTransactionHistoryProps {
  transactionId: string
  transactionType: 'receivable' | 'payable'
  enabled?: boolean
}

export function useTransactionHistory({
  transactionId,
  transactionType,
  enabled = true,
}: UseTransactionHistoryProps) {
  const route = `/financial/${transactionType}/${transactionId}/history`

  const { data, isLoading, error, refetch } =
    useQuery<TransactionHistoryResponse>({
      queryKey: ['transaction-history', transactionType, transactionId],
      enabled: enabled && !!transactionId,
      staleTime: 1000 * 60 * 5, // 5 minutes
      queryFn: async () => {
        const response = await getData({ route })

        if (!response.success) {
          throw new Error(response.message)
        }

        return response.data as TransactionHistoryResponse
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
