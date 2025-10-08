import { getData } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

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
  return res.data
}

export function useContactSources() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['contact-sources-list', PER_PAGE],
    queryFn: fetchData,
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
