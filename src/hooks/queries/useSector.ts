import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

export interface ISector {
  id: string
  name: string
  icon: string
  isActive: boolean
  kind: string
  companyId: string
}

async function fetchData(filters: {
  [key: string]: string | boolean
}): Promise<ISector[]> {
  const data = await getDataOld({
    route: 'sectorRoute',
    perPage: '9999',
    filters,
  })
  return data?.data
}

export function useSector(filters?: { [key: string]: string | boolean }) {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['sectors', '9999', filters],
    queryFn: () => fetchData({ ...filters }),
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
