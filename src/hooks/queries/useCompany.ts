import { getData } from '@/actions/_cruds'
import { ICompanyResponse } from '@/app/(app-sidebar)/configuracoes/empresa-e-sistema/components/CompanyInfo/schema'
import { useQuery } from '@tanstack/react-query'

interface ICompanies {
  id: string
  general: {
    name: string
  }
}

async function fetchData(): Promise<ICompanies[]> {
  const data = (await getData({
    route: '/company',
    perPage: '999999',
  })) as ICompanyResponse

  return data.data.filter((company) => company.isActive === true)
}

export function useCompany() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['company-list'],
    queryFn: fetchData,
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
