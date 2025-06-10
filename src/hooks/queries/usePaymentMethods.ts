import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface IPaymentMethods {
  id: string
  name: string
}

const PER_PAGE = '999999'

async function fetchData(): Promise<IPaymentMethods[]> {
  const data = await getDataOld({
    route: 'paymentMethodRoute',
    perPage: PER_PAGE,
  })
  return data.data.filter((item: { isActive: boolean }) => item.isActive)
}

export function usePaymentMethod() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['payment-method-list', PER_PAGE],
    queryFn: fetchData,
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
