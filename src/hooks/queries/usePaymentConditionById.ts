import { getItemOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

// Types
import type { PaymentConditionsType } from '@/types/settings/paymentCondition'

async function fetchData(id: string): Promise<PaymentConditionsType> {
  const data = await getItemOld({
    route: 'paymentConditionRoute',
    id,
  })

  return data
}

export function usePaymentConditionById({ id }: { id: string }) {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['payment-condition-by-id', id],
    queryFn: () => fetchData(id),
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
