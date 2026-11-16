/* eslint-disable @typescript-eslint/no-explicit-any */
import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

interface ISeries {
  data: {
    id: string
    description: string
    code: string
    isActive: boolean
    isTraining: boolean
    isDefault: boolean
    // Como a série fatura (VR-5): ON_ORDER, ON_DELIVERY, ON_CHECKOUT,
    // ON_SALE ou NO_INVOICE
    billing?: { value: string; label: string }
  }[]
}

async function fetchData(isActive?: boolean): Promise<ISeries> {
  const data = await getDataOld({
    route: 'saleSeriesRoute',
    perPage: '999999',
    filters: {
      isActive: isActive ?? undefined,
    },
  })

  // Garantir que os dados estão no formato esperado
  if (!data || !Array.isArray(data.data)) {
    throw new Error('Failed to fetch series')
  }

  return data
}

export function useSerie(isActive?: boolean) {
  const { status } = useSession()

  const { data, isError, isLoading, isFetching } = useQuery({
    queryKey: ['series-select', isActive],
    queryFn: () => fetchData(isActive),
    staleTime: Infinity,
    // Só executa quando a sessão estiver autenticada
    enabled: status === 'authenticated',
    // Retry em caso de falha
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  })
  return { data, isError, isLoading: isLoading || isFetching }
}
