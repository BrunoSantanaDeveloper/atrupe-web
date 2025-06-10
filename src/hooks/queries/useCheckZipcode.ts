import { getItemOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface ICheckZipcode {
  zipCode: string
  state: string
  city: string
  neighborhood: string
  street: string
  country: string
}

async function fetchData(zipcode: string): Promise<ICheckZipcode | undefined> {
  if (!zipcode || zipcode.length < 8) return undefined

  const data = await getItemOld({ route: 'checkZipcodeRoute', id: zipcode })
  return data
}

export function useCheckZipcode(zipcode: string) {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['checkZipcode', zipcode || ''],
    queryFn: () => fetchData(zipcode),
    enabled: !!zipcode,
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
