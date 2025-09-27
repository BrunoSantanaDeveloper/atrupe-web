import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

// Types
import type {
  PaymentConditionsType,
  ListPaymentConditionsType,
} from '@/types/settings/paymentCondition'

async function fetchData(): Promise<
  ListPaymentConditionsType[] | PaymentConditionsType[]
> {
  const data = await getDataOld({
    route: 'paymentConditionRoute',
    perPage: '999999',
  })

  return (data.data || []) as PaymentConditionsType[]
}

export function usePaymentConditions<T extends boolean>() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['payment-conditions-select'],
    queryFn: () => fetchData(),
    staleTime: Infinity,
  })
  return {
    data: data as T extends true
      ? ListPaymentConditionsType[]
      : PaymentConditionsType[],
    isError,
    isLoading,
  }
}
