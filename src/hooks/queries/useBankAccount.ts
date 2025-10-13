import { getDataOld } from '@/actions/_cruds'
import { BankAccountsType } from '@/types/financial/bank'
import { useQuery } from '@tanstack/react-query'

async function fetchData({
  filters,
  isBankRequired,
}: {
  filters: { bankId?: string; cashControl?: boolean }
  isBankRequired?: boolean
}): Promise<BankAccountsType[]> {
  if (!isBankRequired) {
    delete filters.bankId
  } else if (!filters.bankId) {
    return []
  }

  const data = await getDataOld({
    route: 'bankAccountRoute',
    perPage: '9999',
    filters,
  })
  return data.data
}

export function useBankAccount({
  filters,
  isBankRequired,
}: {
  filters: { bankId?: string; cashControl?: boolean }
  isBankRequired?: boolean
}) {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['bank-account-select', filters],
    queryFn: () => fetchData({ filters, isBankRequired }),
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
