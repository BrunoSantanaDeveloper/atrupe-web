import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface IPaymentMethods {
  id: string
  name: string
}

async function fetchData(type?: string): Promise<IPaymentMethods[]> {
  if (!type) return []

  const data = await getDataOld({
    route: 'paymentMethodRoute',
    customPath: `/available/${type}`,
  })
  return data
}

export function useAvailablePaymentMethods(type?: string) {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['payment-available-method-list', type],
    queryFn: () => fetchData(type),
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
