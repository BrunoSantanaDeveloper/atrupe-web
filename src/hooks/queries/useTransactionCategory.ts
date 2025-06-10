import { getDataOld } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface ITransactionCategory {
  id: string
  code: string
  description: string
}

async function fetchData(
  natureId: string,
  listAll?: boolean,
): Promise<ITransactionCategory[]> {
  if (!natureId && !listAll) return []

  const data = await getDataOld({
    route: 'transactionCategoryRoute',
    customPath: `/${natureId}`,
  })
  return data
}

export function useTransactionCategory({
  natureId,
  listAll,
}: {
  natureId: string
  listAll?: boolean
}) {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['transaction-category-select', natureId, listAll],
    queryFn: () => fetchData(natureId, listAll),
    staleTime: Infinity,
  })
  return { data, isError, isLoading }
}
