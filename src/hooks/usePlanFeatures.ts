'use client'

import { useSession } from 'next-auth/react'

export function usePlanFeatures() {
  const { data: session } = useSession()

  const hasFeature = (feature: string) => {
    if (!session?.company?.plan?.features) return false

    return session.company.plan.features.includes(feature)
  }

  const planName = session?.company?.plan?.name

  const hasAnyFeature = (features: string[]) => {
    return features.some((feature) => hasFeature(feature))
  }

  const hasAllFeatures = (features: string[]) => {
    return features.every((feature) => hasFeature(feature))
  }

  const canManageSectors = () => hasFeature('sectors_configuration')

  const canManageMultipleCompanies = () => hasFeature('multiple_companies')

  const canManageSalesOrders = () => hasFeature('quotation_quick_sale')

  const canManageRejectionReasons = () =>
    hasFeature('quotation_rejection_reasons')

  const canManageBudgetStatus = () =>
    hasFeature('quotation_status_configuration')

  const hasFinancialModule = (
    module: 'receivable' | 'payable' | 'cash' | 'pdv' | 'credit_limit',
  ) => {
    const moduleMap = {
      receivable: 'accounts_receivable',
      payable: 'accounts_payable',
      cash: 'cash_control',
      pdv: 'pdv_screen',
      credit_limit: 'credit_limit_configuration',
    }
    return hasFeature(moduleMap[module])
  }

  const canManageBankAccounts = () => hasFeature('bank_account_creation')

  const canManageBankTaxTransfer = () =>
    hasFeature('payment_condition_operator_fee')

  const canManageProducts = () => hasFeature('product_composition')

  const canManageProductionStages = () =>
    hasFeature('product_production_stages')

  const canManageClients = () => hasFeature('client_additional_tabs')

  const canManageSuppliers = () => hasFeature('supplier_additional_tabs')

  const canManageDeliverySchedule = () => hasFeature('delivery_production_tabs')

  const canShowQuotationItemDetails = () => hasFeature('pdf_show_item_details')

  return {
    planName,
    hasFeature,
    hasAnyFeature,
    hasAllFeatures,
    canManageSectors,
    canManageSalesOrders,
    canManageRejectionReasons,
    canManageBudgetStatus,
    hasFinancialModule,
    canManageBankAccounts,
    canManageBankTaxTransfer,
    canManageProducts,
    canManageProductionStages,
    canManageClients,
    canManageSuppliers,
    canManageDeliverySchedule,
    canManageMultipleCompanies,
    canShowQuotationItemDetails,
  }
}
