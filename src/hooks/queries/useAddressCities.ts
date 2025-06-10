import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface ICities {
  id: string
  name: string
  code: string
}

async function fetchData(stateId: string): Promise<ICities[]> {
  if (!stateId) return []

  const data = await getDataOld({
    route: 'citiesRoute',
    perPage: '999999',
    filters: { stateId },
  })
  return data
}

export function useAddressCities(stateId: string) {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['city-list', stateId || ''],
    queryFn: () => fetchData(stateId),
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
