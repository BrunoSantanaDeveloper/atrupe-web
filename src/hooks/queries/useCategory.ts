import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface ICategory {
  id: string
  name: string
  kind: string
  isActive: boolean
  isStandard: boolean
  companyId: string | null
  parentId: string
  children: ICategory[]
}

async function fetchData(): Promise<ICategory[]> {
  const data = await getDataOld({ route: 'categoryRoute', perPage: '9999' })
  return data?.data || []
}

export function useCategory() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['category-select'],
    queryFn: fetchData,
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
// ------------------------------------------------------------
export interface Sector {
  id: string
  name: string
}

export interface Group {
  id: string
  name: string
  kind: string
  isActive: boolean
  isStandard: boolean
  sectorId: string
  companyId: string
  sector: Sector
}
export interface ICategoryBySector {
  sector: string
  sectorId: string
  groups: Group[]
}

async function fetchDataBySector({
  sectorId,
}: {
  sectorId?: string
}): Promise<ICategoryBySector[]> {
  const data = await getDataOld({
    route: 'categoryRouteBySector',
    perPage: '9999',
    filters: { sectorId },
  })
  return data?.data || []
}
export function useCategoryBySector({ sectorId }: { sectorId?: string }) {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['category-select', sectorId],
    queryFn: () => fetchDataBySector({ sectorId }),
  })
  return { data, isError, isLoading }
}
