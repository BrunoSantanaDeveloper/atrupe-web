import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface ISellers {
  id: string
  name: string
}

const QUERY_KEY = ['sellers']

async function fetchData(): Promise<ISellers[]> {
  const data = await getDataOld({ route: 'sellersRoute' })
  return data
}

export function useSeller() {
  const { data, isError, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchData,
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
