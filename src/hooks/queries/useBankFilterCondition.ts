import { getData } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface IBanks {
  id: string
  name: string
  code: string
}

async function fetchData(conditionId: string): Promise<IBanks[]> {
  if (!conditionId) return []

  const data = await getData({
    route: `/bank/condition/${conditionId}`,
    perPage: '9999',
  })
  return data.data.filter((item: { isActive: boolean }) => item.isActive)
}

export function useBankFilterCondition(conditionId: string) {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['bank-filter-condition', conditionId],
    queryFn: () => fetchData(conditionId),
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
