/* eslint-disable @typescript-eslint/no-explicit-any */
import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface ISeries {
  data: {
    id: string
    description: string
    code: string
    isActive: boolean
    isTraining: boolean
  }[]
}

async function fetchData(isActive?: boolean): Promise<ISeries> {
  const data = await getDataOld({
    route: 'saleSeriesRoute',
    perPage: '999999',
    filters: {
      isActive: isActive ?? undefined,
    },
  })

  return data
}

export function useSerie(isActive?: boolean) {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['series-select', isActive],
    queryFn: () => fetchData(isActive),
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
