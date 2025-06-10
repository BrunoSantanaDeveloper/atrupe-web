import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface IStates {
  id: string
  name: string
  code: string
}

async function fetchData(): Promise<IStates[]> {
  const data = await getDataOld({ route: 'statesRoute', perPage: '999999' })
  return data
}

export function useAddressStates() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['state-list'],
    queryFn: fetchData,
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
