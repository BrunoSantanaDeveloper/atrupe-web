import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiInstance from '@/lib/api'

// Tipos para as variantes de unidades de medida
export interface UnitVariant {
  code: string
  name: string
  isDefault: boolean
}

export interface MeasureDefaults {
  length: string
  weight: string
  capacity: string
}

// Service para as APIs de unidades de medida
export const measureDefaultsApi = {
  // Buscar variantes disponíveis por tipo
  getVariants: async (
    kind: 'LENGTH' | 'WEIGHT' | 'CAPACITY',
  ): Promise<UnitVariant[]> => {
    const api = await apiInstance()
    const response = await api.get(`/unit-of-measure/variants/${kind}`)
    return response.data
  },

  // Atualizar padrão da empresa
  updateDefault: async (
    kind: 'LENGTH' | 'WEIGHT' | 'CAPACITY',
    variant: string,
  ) => {
    const api = await apiInstance()
    const response = await api.put(`/unit-of-measure/default-variant/${kind}`, {
      defaultVariant: variant,
    })
    return response.data
  },
}

// Hook para buscar todas as variantes
export function useMeasureVariants() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['measureVariants'],
    queryFn: async () => {
      const [length, weight, capacity] = await Promise.all([
        measureDefaultsApi.getVariants('LENGTH'),
        measureDefaultsApi.getVariants('WEIGHT'),
        measureDefaultsApi.getVariants('CAPACITY'),
      ])

      return {
        length,
        weight,
        capacity,
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  return { data, isLoading, isError }
}

// Hook para buscar padrões atuais da empresa
export function useCurrentMeasureDefaults() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['currentMeasureDefaults'],
    queryFn: async () => {
      const [length, weight, capacity] = await Promise.all([
        measureDefaultsApi.getVariants('LENGTH'),
        measureDefaultsApi.getVariants('WEIGHT'),
        measureDefaultsApi.getVariants('CAPACITY'),
      ])

      return {
        length: length.find((item) => item.isDefault)?.code || 'MM',
        weight: weight.find((item) => item.isDefault)?.code || 'MG',
        capacity: capacity.find((item) => item.isDefault)?.code || 'ML',
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  return { data, isLoading, isError }
}

// Hook para mutation de atualização dos padrões
export function useUpdateMeasureDefaults() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: MeasureDefaults) => {
      await Promise.all([
        measureDefaultsApi.updateDefault('LENGTH', data.length),
        measureDefaultsApi.updateDefault('WEIGHT', data.weight),
        measureDefaultsApi.updateDefault('CAPACITY', data.capacity),
      ])
    },
    onSuccess: () => {
      // Invalidar cache para recarregar dados
      queryClient.invalidateQueries({ queryKey: ['measureVariants'] })
      queryClient.invalidateQueries({ queryKey: ['currentMeasureDefaults'] })
      queryClient.invalidateQueries({ queryKey: ['unitMeasures'] })
    },
  })
}
