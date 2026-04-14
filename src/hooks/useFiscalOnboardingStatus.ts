'use client'

import { useEffect, useState } from 'react'
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
  const [data, setData] = useState<FiscalOnboardingStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchStatus() {
      try {
        const result = await getItem({ route: '/fiscal/onboarding/status' })
        if (!cancelled && result.success) {
          setData(result.data as FiscalOnboardingStatus)
        }
      } catch {
        // Silently fail — fiscal module might not be contracted
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchStatus()
    return () => {
      cancelled = true
    }
  }, [])

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
