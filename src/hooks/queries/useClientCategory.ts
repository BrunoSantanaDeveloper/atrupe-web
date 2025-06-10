import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface IClientCategories {
  id: string
  name: string
  code: string
}

async function fetchData(): Promise<IClientCategories[]> {
  const data = await getDataOld({
    route: 'clientCategoryRoute',
    perPage: '9999',
  })
  return data.data
}

export function useClientCategory() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['client-categories-select'],
    queryFn: fetchData,
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
