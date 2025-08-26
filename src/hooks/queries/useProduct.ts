import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

export interface IProductItem {
  id: string
  name: string
  productId: string
  unitKind: string
  unitCost: number
  salePrice: number
  quantity: number
}

export interface IProduct {
  id: string
  name: string
  code: string
  isActive: boolean
  isStandard: boolean
  unitKind: string | null
  unitCost: number | null
  salePrice: number | null
  quantity: number | null
  companyId: string
  categoryId: string
  sectorId: string
  items: IProductItem[]
}

interface ProductFilters {
  search?: string
  categoryId?: string
  sectorId?: string
}
const QUERY_KEY = 'products'
const PER_PAGE = '99999'

async function fetchData(filters: ProductFilters): Promise<IProduct[]> {
  // Monta os parâmetros de busca
  const params = new URLSearchParams()

  if (filters.search) params.append('search', filters.search)
  if (filters.categoryId) params.append('categoryId', filters.categoryId)
  if (filters.sectorId) params.append('sectorId', filters.sectorId)

  const data = await getDataOld({
    route: 'productRoute',
    perPage: PER_PAGE,
    filters: Object.fromEntries(params),
  })

  return data.data
}

export function useProducts(filters: ProductFilters = {}) {
  const queryKey = [QUERY_KEY, PER_PAGE, filters]

  const { data, isError, isLoading, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchData(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  return { data, isError, isLoading, refetch }
}
