import { getItemOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface ICheckCpf {
  name: string
  cpf: string
  birthdate: string
  motherName: string
}

async function fetchData(cpf: string): Promise<ICheckCpf | undefined> {
  if (!cpf || cpf.length < 11) return

  const data = await getItemOld({ route: 'checkCpfRoute', id: cpf })
  return data
}

export function useCheckCpf(cpf: string) {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['checkCpf', cpf || ''],
    queryFn: () => fetchData(cpf),
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
