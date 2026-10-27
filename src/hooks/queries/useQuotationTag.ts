import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface QuotationStatusType {
  id: string
  title: string
  color: string
  quotations?: number
}

const PER_PAGE = '999999'

async function fetchData(): Promise<QuotationStatusType[]> {
  const data = await getDataOld({
    route: 'quotationStatusRoute',
    perPage: PER_PAGE,
  })
  return data.quotationTags
}

export function useQuotationTag() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['quotation-status-select'],
    queryFn: fetchData,
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
