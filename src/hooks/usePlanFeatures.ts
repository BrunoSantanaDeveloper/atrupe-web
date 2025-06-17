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

  // Financeiro
  const hasFinancialModule = (
    module: 'receivable' | 'payable' | 'cash' | 'pdv' | 'credit_limit',
  ) => {
    const moduleMap = {
      receivable: 'accounts_receivable',
      payable: 'accounts_payable',
      cash: 'cash_control',
      pdv: 'pdv',
      credit_limit: 'credit_limit',
    }
    return hasFeature(moduleMap[module])
  }

  const getBankAccountsType = () => {
    if (hasFeature('bank_accounts_full')) return 'full'
    if (hasFeature('bank_accounts_limited')) return 'limited'
    return 'none'
  }

  const getProductsType = () => {
    if (hasFeature('products_full')) return 'full'
    if (hasFeature('products_limited')) return 'limited'
    return 'none'
  }

  const getProductionStagesType = () => {
    if (hasFeature('production_stages_full')) return 'full'
    if (hasFeature('production_stages_limited')) return 'limited'
    return 'none'
  }

  const getClientsType = () => {
    if (hasFeature('clients_full')) return 'full'
    if (hasFeature('clients_limited')) return 'limited'
    return 'none'
  }

  const getSuppliersType = () => {
    if (hasFeature('suppliers_full')) return 'full'
    if (hasFeature('suppliers_limited')) return 'limited'
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
    hasFinancialModule,
    getBankAccountsType,
    getProductsType,
    getProductionStagesType,
    getClientsType,
    getSuppliersType,
  }
}
