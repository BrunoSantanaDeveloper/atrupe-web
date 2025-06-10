import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

export interface IProductGroup {
  id: string
  name: string
}

export interface IProductGroupWithSector {
  sector: string
  sectorId: string
  groups: {
    id: string
    name: string
  }[]
}

async function fetchData(): Promise<IProductGroup[]> {
  const data = await getDataOld({
    route: 'ProductGroupRoute',
    perPage: '999999',
  })
  return data?.data
}

export function useProductGroup() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['product-group-list'],
    queryFn: fetchData,
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}

async function fetchDataWithSector(): Promise<IProductGroupWithSector[]> {
  const data = await getDataOld({
    route: 'productGroupTotalsRouteBySector',
    perPage: '999999',
  })
  return data?.data
}

export function useProductGroupWithSector() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['product-group-list'],
    queryFn: fetchDataWithSector,
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
