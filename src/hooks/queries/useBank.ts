import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface IBanks {
  id: string
  name: string
  code: string
}

async function fetchData(): Promise<IBanks[]> {
  const data = await getDataOld({ route: 'bankRoute', perPage: '9999' })
  return data
}

export function useBank() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['bank-select'],
    queryFn: fetchData,
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
