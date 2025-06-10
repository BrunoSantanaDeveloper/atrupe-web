import { getDataOld } from '@/actions/_cruds'
import { RoleType } from '@/types/settings/role'
import { useQuery } from '@tanstack/react-query'

async function fetchData(filters: {
  [key: string]: string | boolean
}): Promise<RoleType[]> {
  const data = await getDataOld({
    route: 'roleRoute',
    perPage: '9999',
    filters,
  })
  return data.data[0].roles
}

export function useRole(filters?: { [key: string]: string | boolean }) {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['roles-select', filters],
    queryFn: () => fetchData({ ...filters }),
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
