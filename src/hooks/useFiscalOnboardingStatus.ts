'use client'

import { useQuery } from '@tanstack/react-query'
import { getItem } from '@/actions/_cruds'

interface FiscalOnboardingStatus {
  status:
    | 'NOT_STARTED'
    | 'PENDING'
    | 'PROVISIONING'
    | 'ACTIVE'
    | 'PENDING_REVIEW'
    | 'REJECTED'
  hasConfig: boolean
  createdAt?: string
  errorMessage?: string
}

export function useFiscalOnboardingStatus() {
  const { data: queryData, isLoading } = useQuery({
    queryKey: ['fiscal-onboarding-status'],
    queryFn: async () => {
      const result = await getItem({ route: '/fiscal/onboarding/status' })
      if (!result.success) throw new Error('Failed to fetch status')
      return result.data as FiscalOnboardingStatus
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry if it fails
    refetchOnWindowFocus: false,
  })

  const data = queryData || null

  const isPending =
    data?.status === 'PENDING' ||
    data?.status === 'PROVISIONING' ||
    data?.status === 'PENDING_REVIEW'

  const isActive = data?.status === 'ACTIVE' && data?.hasConfig
  const needsSetup = data?.status === 'NOT_STARTED'

  return {
    data,
    isLoading,
    isPending,
    isActive,
    needsSetup,
  }
}
