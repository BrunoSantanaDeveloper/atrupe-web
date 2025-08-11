import { getData } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface IPaymentMethodsWithConditions {
  id: string
  name: string
}

const PER_PAGE = '999999'

async function fetchData(): Promise<IPaymentMethodsWithConditions[]> {
  const data = await getData({
    route: '/payment/method/with-conditions',
  })
  return data.data.filter((item: { isActive: boolean }) => item.isActive)
}

export function usePaymentMethodsWithConditions() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['payment-method-with-conditions-list', PER_PAGE],
    queryFn: fetchData,
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
