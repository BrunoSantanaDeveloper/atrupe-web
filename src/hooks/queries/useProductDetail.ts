import { getItemOld } from '@/actions/_cruds'
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
  technicalDescription?: string | null
  allowEditDescription: boolean
  allowEditValues: boolean
  // Quantidade mínima na unidade comercial (0,5 m², 3 un): abaixo dela o
  // item é cobrado pelo mínimo
  minQuantity?: number | null
  // Produto terceirizado (T-5) e os fornecedores dele: o item do orçamento
  // escolhe de qual compra (12/11/2026)
  isOutsourced?: boolean
  suppliers?: { id: string; name: string }[]
  // A situação da composição (IP-14 revisto): só a aprovada leva os campos
  // do orçamento ao item; nulo quando o produto não tem composição
  compositionStatus?: 'DRAFT' | 'RELEASED' | 'PART' | null
}

const QUERY_KEY = 'product'

async function fetchData(productId: string): Promise<IProduct | undefined> {
  if (!productId) {
    return undefined
  }
  const data = await getItemOld({
    route: 'productRoute',
    id: productId,
  })
  return data
}

export function useProductDetail(productId: string) {
  const queryKey = [QUERY_KEY, productId]

  const { data, isError, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchData(productId),
    enabled: !!productId,
    staleTime: Infinity,
  })

  return { data, isError, isLoading }
}
