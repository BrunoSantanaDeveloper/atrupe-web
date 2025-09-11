import { getData } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface IEmployees {
  id: string
  name: string
}

async function fetchData(): Promise<IEmployees[]> {
  const data = await getData({ route: '/employee/list' })
  return data.data
}

export function useEmployee() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['employee-profile-select'],
    queryFn: fetchData,
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
