import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface IBanks {
  id: string
  name: string
  code: string
}

async function fetchData(): Promise<IBanks[]> {
  const data = await getDataOld({ route: 'bankRoute', perPage: '9999' })
  // Só lista: um corpo de outro formato (erro, API de mentira da fronteira)
  // derrubava a tela de contas bancárias no .filter do campo Banco
  return Array.isArray(data) ? data : []
}

export function useBank() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['bank-select'],
    queryFn: fetchData,
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
