import { getData } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

// Types
import type { PaymentConditionsType } from '@/types/settings/paymentCondition'

async function fetchData(): Promise<PaymentConditionsType[]> {
  const res = await getData({
    route: '/payment-condition',
    perPage: '9999',
    // Só as ativas: condição inativada nas configurações não deve mais
    // aparecer para escolher no orçamento.
    filters: { isActive: 'true' },
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
