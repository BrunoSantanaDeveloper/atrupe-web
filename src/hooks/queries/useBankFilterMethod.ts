import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface IBanks {
  id: string
  name: string
  code: string
}

async function fetchData(methodId: string): Promise<IBanks[]> {
  if (!methodId) return []

  const data = await getDataOld({
    route: 'bankMethodRoute',
    perPage: '9999',
    customPath: `/${methodId}`,
  })
  return data
}

export function useBankFilterMethod(methodId: string) {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['bank-filter-method', methodId],
    queryFn: () => fetchData(methodId),
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
