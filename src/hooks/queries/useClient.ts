import { getItemOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

export function useClientById({ id }: { id: string }) {
  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['client-data', id],
    enabled: !!id,
    queryFn: () => getItemOld({ route: 'clientRoute', id }),
  })

  return {
    data,
    isLoading,
  }
}
