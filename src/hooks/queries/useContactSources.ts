import { getData } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

export interface IContactSource {
  id: string
  name: string
  companyId?: string | null
}

const PER_PAGE = '999999'

async function fetchData(): Promise<IContactSource[]> {
  const res = await getData({
    route: '/contact-source',
    perPage: PER_PAGE,
  })

  if (!res.success || !Array.isArray(res.data)) {
    throw new Error('Failed to fetch contact sources')
  }

  return res.data
}

export function useContactSources() {
  const { status } = useSession()

  const { data, isError, isLoading, isFetching } = useQuery({
    queryKey: ['contact-sources-list'],
    queryFn: fetchData,
    staleTime: Infinity,
    enabled: status === 'authenticated',
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  })
  return { data, isError, isLoading: isLoading || isFetching }
}
