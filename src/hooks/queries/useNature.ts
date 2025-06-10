import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface INature {
  id: string
  code: string
  description: string
  level1: string
  level2: string
}

async function fetchData(level1?: string, level2?: string): Promise<INature[]> {
  const data = await getDataOld({
    route: 'accountsPlanRoute',
    customPath: `/natures/${level1}/level2/${level2}`,
  })
  return data
}

export function useNatures(level1?: string, level2?: string) {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['natures-select', level1, level2],
    queryFn: () => fetchData(level1, level2),
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
