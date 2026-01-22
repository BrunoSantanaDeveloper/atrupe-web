import { getData } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

interface IContactSource {
  id: string
  name: string
}

const PER_PAGE = '999999'

async function fetchData(): Promise<IContactSource[]> {
  const res = await getData({
    route: '/sale/quotation/contact-sources',
    perPage: PER_PAGE,
  })

  // Garantir que sempre retorne um array
  if (!res.success || !Array.isArray(res.data)) {
    throw new Error('Failed to fetch contact sources')
  }

  return res.data
}

export function useContactSources() {
  const { status } = useSession()

  const { data, isError, isLoading, isFetching } = useQuery({
    queryKey: ['contact-sources-list', PER_PAGE],
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
