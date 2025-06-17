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

  const getSalesOrdersType = () => {
    if (hasFeature('sales_orders_full')) return 'full'
    if (hasFeature('sales_orders_limited')) return 'limited'
    return 'none'
  }

  const getRejectionReasonsType = () => {
    if (hasFeature('rejection_reasons_full')) return 'full'
    if (hasFeature('rejection_reasons_limited')) return 'limited'
    return 'none'
  }

  const getBudgetStatusType = () => {
    if (hasFeature('budget_status_full')) return 'full'
    if (hasFeature('budget_status_limited')) return 'limited'
    return 'none'
  }

  return {
    hasFeature,
    hasAnyFeature,
    hasAllFeatures,
    getUserLimit,
    canManageSectors,
    getSalesOrdersType,
    getRejectionReasonsType,
    getBudgetStatusType,
  }
}
