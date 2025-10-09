import { getData } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

// Types
import type { PaymentConditionsType } from '@/types/settings/paymentCondition'

async function fetchData(): Promise<PaymentConditionsType[]> {
  const res = await getData({
    route: '/payment-condition',
    perPage: '9999',
  })

  return (res.data || []) as PaymentConditionsType[]
}

export function usePaymentConditions() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['payment-conditions-select'],
    queryFn: () => fetchData(),
    staleTime: Infinity,
  })
  return {
    data: data || [],
    isError,
    isLoading,
  }
}
