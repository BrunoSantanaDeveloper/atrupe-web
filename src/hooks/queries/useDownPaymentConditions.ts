import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

// Types
import type {
  PaymentConditionsType,
  ListPaymentConditionsType,
} from '@/types/settings/paymentCondition'

async function fetchData(
  paymentMethodId: string,
  listAll: boolean,
): Promise<ListPaymentConditionsType[] | PaymentConditionsType[]> {
  if (!paymentMethodId && !listAll) return []

  const data = await getDataOld({
    route: 'downPaymentConditionRoute',
    perPage: '999999',
    filters: { paymentMethodId },
  })

  if (listAll) return data.data as ListPaymentConditionsType[]

  return (data.data[0]?.conditions ?? []) as PaymentConditionsType[]
}

export function useDownPaymentConditions<T extends boolean>({
  paymentMethodId,
  listAll,
}: {
  paymentMethodId?: string
  listAll?: T
}) {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['down-payment-conditions-select', paymentMethodId],
    queryFn: () => fetchData(paymentMethodId ?? '', listAll ?? false),
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
