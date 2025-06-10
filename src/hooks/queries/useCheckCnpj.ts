import { getItemOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface ICheckCnpj {
  name: string
  legalName: string
  cnpj: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zipcode: string
    country: string
    neighborhood: string
  }
}

async function fetchData(cnpj: string): Promise<ICheckCnpj | undefined> {
  if (!cnpj || cnpj.length < 14) return

  const data = await getItemOld({ route: 'checkCnpjRoute', id: cnpj })
  return data
}

export function useCheckCnpj(cnpj: string) {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['checkCnpj', cnpj || ''],
    queryFn: () => fetchData(cnpj),
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
