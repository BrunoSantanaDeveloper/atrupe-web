import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

export interface ISector {
  id: string
  name: string
  icon: string
}

async function fetchData(): Promise<ISector[]> {
  const data = await getDataOld({
    route: 'sectorWithProductsRoute',
  })
  return data
}

export function useSectorWithProducts() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['sectors-with-products'],
    queryFn: () => fetchData(),
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
