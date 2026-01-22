import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

interface ISellers {
  id: string
  name: string
}

const QUERY_KEY = ['sellers']

async function fetchData(): Promise<ISellers[]> {
  const data = await getDataOld({ route: 'sellersRoute' })
  // Garantir que sempre retorne um array
  if (!Array.isArray(data)) {
    throw new Error('Failed to fetch sellers')
  }
  return data
}

export function useSeller() {
  const { status } = useSession()

  const { data, isError, isLoading, isFetching } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchData,
    staleTime: Infinity,
    // Só executa quando a sessão estiver autenticada
    enabled: status === 'authenticated',
    // Retry em caso de falha
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  })
  return { data, isError, isLoading: isLoading || isFetching }
}
