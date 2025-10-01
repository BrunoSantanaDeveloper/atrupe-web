import { getData } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

// Types
import type { PaymentConditionsType } from '@/types/settings/paymentCondition'

async function fetchData(
  type?: 'receivable' | 'payable',
): Promise<PaymentConditionsType[]> {
  if (!type) return []

  const res = await getData({
    route: `/payment/condition/available/${type}`,
  })

  return (res.data || []) as PaymentConditionsType[]
}

export function useAvailablePaymentConditions(type?: 'receivable' | 'payable') {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['available-payment-conditions', type],
    queryFn: () => fetchData(type),
    staleTime: Infinity,
    enabled: !!type,
  })

  return {
    data: data as PaymentConditionsType[],
    isError,
    isLoading,
  }
}
