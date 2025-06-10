import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface IClient {
  id: string
  name: string
  cnpj?: string
  cpf?: string
}

const PER_PAGE = '9999'

async function fetchClients(query: string): Promise<IClient[]> {
  if (query.length < 3) return []

  const data = await getDataOld({
    route: 'clientRoute',
    filters: { search: query },
    perPage: PER_PAGE,
  })
  return data?.data || []
}

export function useClientSearch(query: string) {
  return useQuery({
    queryKey: ['client-select', query, PER_PAGE],
    queryFn: () => fetchClients(query),
    enabled: query.length >= 3,
    staleTime: Infinity,
  })
}
