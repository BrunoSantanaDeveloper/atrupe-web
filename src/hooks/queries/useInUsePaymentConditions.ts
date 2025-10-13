import { getData } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

// Types
import type { PaymentConditionsType } from '@/types/settings/paymentCondition'

async function fetchData(): Promise<PaymentConditionsType[]> {
  const res = await getData({
    route: '/payment-condition/in-use',
  })

  return (res.data || []) as PaymentConditionsType[]
}

export function useInUsePaymentConditions() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['in-use-payment-conditions'],
    queryFn: fetchData,
    staleTime: Infinity,
  })

  return {
    data: data as PaymentConditionsType[],
    isError,
    isLoading,
  }
}
