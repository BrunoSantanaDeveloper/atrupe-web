import { updateItemNew } from '@/actions/_cruds'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export interface UpdateUnitDefaultPayload {
  kind: 'LENGTH' | 'WEIGHT' | 'CAPACITY'
  defaultVariant: string
}

export function useUpdateUnitDefaults() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (payload: UpdateUnitDefaultPayload) => {
      const response = await updateItemNew({
        route: `/unit-of-measure/default-variant/${payload.kind}`,
        data: { defaultVariant: payload.defaultVariant },
      })
      return response
    },
    onSuccess: () => {
      // Invalidar cache dos padrões da empresa
      queryClient.invalidateQueries({
        queryKey: ['company-unit-defaults'],
      })
    },
  })

  return mutation
}
