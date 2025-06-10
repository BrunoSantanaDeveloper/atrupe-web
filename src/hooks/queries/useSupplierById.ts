import { getItemOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

export function useSupplierById({ id }: { id: string }) {
  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['supplier-data', id],
    enabled: !!id,
    queryFn: () => getItemOld({ route: 'supplierRoute', id }),
  })

  return {
    data,
    isLoading,
  }
}
