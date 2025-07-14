import { getData } from '@/actions/_cruds'
import { useQuery } from '@tanstack/react-query'

export interface UnitVariant {
  code: string
  name: string
  isDefault: boolean
}

export interface CompanyUnitDefaults {
  LENGTH: string
  WEIGHT: string
  CAPACITY: string
}

export interface UnitOfMeasureData {
  companyDefaults: CompanyUnitDefaults
  lengthVariants: UnitVariant[]
  weightVariants: UnitVariant[]
  capacityVariants: UnitVariant[]
}

// Hook para buscar padrões atuais da empresa
export function useCompanyUnitDefaults() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['company-unit-defaults'],
    queryFn: async () => {
      const response = await getData({
        route: '/unit-of-measure/company-defaults',
      })
      return response.data as CompanyUnitDefaults
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  return { data, isError, isLoading }
}

// Hook para buscar variantes disponíveis por tipo (sem defaults)
export function useUnitVariants(kind: 'LENGTH' | 'WEIGHT' | 'CAPACITY') {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['unit-variants', kind],
    queryFn: async () => {
      const response = await getData({
        route: `/unit-of-measure/variants/${kind}`,
      })
      return response.data as UnitVariant[]
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  })

  return { data, isError, isLoading }
}

// Hook para buscar variantes com defaults da empresa
export function useUnitVariantsWithDefaults(
  kind: 'LENGTH' | 'WEIGHT' | 'CAPACITY',
) {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['unit-variants-with-defaults', kind],
    queryFn: async () => {
      const response = await getData({
        route: `/unit-of-measure/variants/${kind}/with-defaults`,
      })
      return response.data as UnitVariant[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  return { data, isError, isLoading }
}

// Hook otimizado que busca todas as informações de uma só vez
export function useUnitOfMeasureComplete() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['unit-of-measure-complete'],
    queryFn: async () => {
      const [
        defaultsResponse,
        lengthResponse,
        weightResponse,
        capacityResponse,
      ] = await Promise.all([
        getData({ route: '/unit-of-measure/company-defaults' }),
        getData({ route: '/unit-of-measure/variants/LENGTH/with-defaults' }),
        getData({ route: '/unit-of-measure/variants/WEIGHT/with-defaults' }),
        getData({ route: '/unit-of-measure/variants/CAPACITY/with-defaults' }),
      ])

      return {
        companyDefaults: defaultsResponse.data as CompanyUnitDefaults,
        lengthVariants: lengthResponse.data as UnitVariant[],
        weightVariants: weightResponse.data as UnitVariant[],
        capacityVariants: capacityResponse.data as UnitVariant[],
      } as UnitOfMeasureData
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  return { data, isError, isLoading }
}
