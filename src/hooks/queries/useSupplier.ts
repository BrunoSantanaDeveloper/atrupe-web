import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface ISupplier {
  id: string
  name: string
  cnpj?: string
  cpf?: string
}

async function fetchSuppliers(query: string): Promise<ISupplier[]> {
  if (query.length < 3) return []

  const data = await getDataOld({
    route: 'supplierRoute',
    filters: { search: query },
    perPage: '999',
  })

  return data.data
}

export function useSupplierSearch(query: string) {
  return useQuery({
    queryKey: ['suppliers', query],
    queryFn: () => fetchSuppliers(query),
    enabled: query.length >= 3,
    staleTime: Infinity,
  })
}
