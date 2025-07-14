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
      // Invalidar cache das variantes com defaults
      queryClient.invalidateQueries({
        queryKey: ['unit-variants-with-defaults'],
      })
      // Invalidar cache completo
      queryClient.invalidateQueries({
        queryKey: ['unit-of-measure-complete'],
      })
    },
  })

  return mutation
}
