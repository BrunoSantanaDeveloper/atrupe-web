import { getData } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface IPaymentMethods {
  id: string
  name: string
}

const PER_PAGE = '999999'

async function fetchData(): Promise<IPaymentMethods[]> {
  const res = await getData({
    route: '/payment/method',
    perPage: PER_PAGE,
  })
  return res.data.filter((item: { isActive: boolean }) => item.isActive)
}

export function usePaymentMethod() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['payment-method-list', PER_PAGE],
    queryFn: fetchData,
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
