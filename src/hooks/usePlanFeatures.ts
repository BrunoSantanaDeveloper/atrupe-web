'use client'

import { useSession } from 'next-auth/react'

export function usePlanFeatures() {
  const { data: session } = useSession()

  const hasFeature = (feature: string) => {
    if (!session?.company?.plan?.features) return false

    return session.company.plan.features.includes(feature)
  }

  const hasAnyFeature = (features: string[]) => {
    return features.some((feature) => hasFeature(feature))
  }

  const hasAllFeatures = (features: string[]) => {
    return features.every((feature) => hasFeature(feature))
  }

  const getUserLimit = () => {
    if (hasFeature('user_limit_5')) return 5
    if (hasFeature('user_limit_3')) return 3
    return 0
  }

  const canManageSectors = () => hasFeature('sectors_management')

  return {
    hasFeature,
    hasAnyFeature,
    hasAllFeatures,
    getUserLimit,
    canManageSectors,
  }
}
