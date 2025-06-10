import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface ITransactionNature {
  id: string
  code: string
  description: string
  type?: 'receivable' | 'payable'
}

async function fetchData(
  type?: 'receivable' | 'payable',
): Promise<ITransactionNature[]> {
  if (!type) return []

  const data = await getDataOld({
    route: 'accountsPlanRoute',
    customPath: `/natures/${type}`,
    perPage: '999999',
  })
  return data
}

export function useTransactionNature(type?: 'receivable' | 'payable') {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['transaction-nature-select', type],
    queryFn: () => fetchData(type),
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
