import { getData } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

async function fetchData(): Promise<[]> {
  const res = await getData({
    route: '/bank/account/in-use',
  })

  return res.data || []
}

export function useInUseBankAccounts() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['in-use-bank-accounts'],
    queryFn: fetchData,
    staleTime: Infinity,
  })

  return {
    data,
    isError,
    isLoading,
  }
}
