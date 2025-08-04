import { useQuery } from '@tanstack/react-query'
import { getItem } from '@/actions/_cruds'

interface ClientAddress {
  id: string
  type: string
  zipcode: string
  state: string
  city: string
  neighborhood: string
  street: string
  number: string
  complement?: string
  ownerId: string
  ownerType: string
}

async function fetchClientAddresses(
  clientId: string,
): Promise<ClientAddress[]> {
  const response = await getItem({ route: `/address/client/${clientId}` })
  return response.data
}

export function useClientAddresses({ clientId }: { clientId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['client-addresses', clientId],
    queryFn: () => fetchClientAddresses(clientId),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  return {
    data,
    isLoading,
    isError,
  }
}
