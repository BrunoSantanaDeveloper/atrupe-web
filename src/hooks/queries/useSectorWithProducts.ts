import { getDataOld } from '@/actions/_cruds'
import { type QueryClient, useQuery } from '@tanstack/react-query'

export interface ISector {
  id: string
  name: string
  icon: string
}

async function fetchData(): Promise<ISector[]> {
  const data = await getDataOld({
    route: 'sectorWithProductsRoute',
  })
  return data
}

export function useSectorWithProducts() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['sectors-with-products'],
    queryFn: () => fetchData(),
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}

/**
 * Busca a grade de setores antes do modal "Qual item deseja adicionar?"
 * abrir (Lista Lite 19/11, item 10): a venda rápida abria o modal estreito,
 * com o carregando, e ele crescia quando os setores chegavam.
 */
export function prefetchSectorsWithProducts(queryClient: QueryClient) {
  return queryClient.prefetchQuery({
    queryKey: ['sectors-with-products'],
    queryFn: () => fetchData(),
    staleTime: Infinity,
  })
}
