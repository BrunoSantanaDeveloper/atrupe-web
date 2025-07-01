import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import type {
  EmployeeType,
  ListEmployeeDataType,
} from '@/types/settings/employee'

async function fetchCurrentEmployee(
  employeeId: string,
): Promise<EmployeeType | null> {
  if (!employeeId) return null

  try {
    // Buscar todos os funcionários
    const data = await getDataOld({
      route: 'employeeRoute',
    })

    // A API retorna data.data que é um array de ListEmployeeDataType[]
    const employeeArray: ListEmployeeDataType[] = data?.data || []

    // Buscar o funcionário específico na resposta
    for (const group of employeeArray) {
      const employee = group.employees.find(
        (emp: EmployeeType) => emp.id === employeeId,
      )
      if (employee) return employee
    }

    return null
  } catch (error) {
    console.error('Erro ao buscar dados do funcionário:', error)
    return null
  }
}

export function useCurrentEmployee() {
  const { data: session } = useSession()
  const employeeId = session?.user?.employeeId

  const { data, isError, isLoading } = useQuery({
    queryKey: ['current-employee', employeeId],
    queryFn: () => fetchCurrentEmployee(employeeId || ''),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  return { data, isError, isLoading }
}
