import { getData } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

interface CategoryOption {
  id: string
  name: string
  kind: 'CLIENT' | 'SUPPLIER'
}

interface CategorySelectOption {
  value: string
  label: string
}

async function fetchCategoryOptions(
  kind: 'CLIENT' | 'SUPPLIER',
): Promise<CategorySelectOption[]> {
  const response = await getData({
    route: '/category',
    filters: { kind },
  })

  const categories: CategoryOption[] = response?.data || []

  return categories.map((category) => ({
    value: category.id,
    label: category.name,
  }))
}

export function useCategoryOptions(kind: 'CLIENT' | 'SUPPLIER') {
  const { data, isError, isLoading } = useQuery({
    queryKey: [`category-options-${kind}`],
    queryFn: () => fetchCategoryOptions(kind),
    staleTime: Infinity,
  })

  return {
    data: data || [],
    isError,
    isLoading,
  }
}
