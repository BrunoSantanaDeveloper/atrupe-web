import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface IUnitOfMeasure {
  id: string
  name: string
  code: string
  description: string | null
  isActive: boolean
  companyId: string
}

const QUERY_KEY = ['unitOfMeasure']

async function fetchData(): Promise<IUnitOfMeasure[]> {
  const data = await getDataOld({
    route: 'unitOfMeasureRoute',
    perPage: '999999',
  })
  return data
}

export function useUnitOfMeasure() {
  const { data, isError, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchData,
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
