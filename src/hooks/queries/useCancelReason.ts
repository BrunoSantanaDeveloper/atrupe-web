import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface QuotationStatusType {
  type: 'CANCELLATION' | 'REJECTION'
  reasons: {
    id: string
    reason: string
  }[]
}

async function fetchData(): Promise<QuotationStatusType[]> {
  const data = await getDataOld({
    route: 'cancelReasonRoute',
    perPage: '9999',
  })
  return data.data
}

export function useCancelReason(
  type: 'CANCELLATION' | 'REJECTION' | undefined,
) {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['cancel-reason-select', type],
    queryFn: fetchData,
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
