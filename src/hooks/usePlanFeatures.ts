'use client'

import { useSession } from 'next-auth/react'
import { useCallback, useMemo } from 'react'

// Desenvolvimento: recursos do PRO/ELITE/FULL ainda não existem no backend, que
// é quem monta `company.plan.features` no login. Enquanto isso, o ambiente local
// pode simular a contratação pela variável NEXT_PUBLIC_DEV_FEATURES
// (ex.: NEXT_PUBLIC_DEV_FEATURES=cost_base,pricing_center). Sem a variável, nada
// muda. Remover quando o backend criar as features do PRO.
const devFeatures = (process.env.NEXT_PUBLIC_DEV_FEATURES || '')
  .split(',')
  .map((feature) => feature.trim())
  .filter(Boolean)

export function usePlanFeatures() {
  const { data: session } = useSession()

  const planFeatures = session?.company?.plan?.features

  const features = useMemo(
    () =>
      devFeatures.length
        ? [...(planFeatures || []), ...devFeatures]
        : planFeatures,
    [planFeatures],
  )

  const hasFeature = useCallback(
    (feature: string) => {
      if (!features) return false

      return features.includes(feature)
    },
    [features],
  )

  const planName = session?.company?.plan?.name

  const hasAnyFeature = useCallback(
    (featureList: string[]) => {
      return featureList.some((feature) => hasFeature(feature))
    },
    [hasFeature],
  )

  const hasAllFeatures = useCallback(
    (featureList: string[]) => {
      return featureList.every((feature) => hasFeature(feature))
    },
    [hasFeature],
  )

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

  const canCreateBankAccount = () => hasFeature('bank_account_creation')

  const canDeleteBankAccount = () => hasFeature('bank_account_delete')

  const canProvision = () => hasFeature('bank_account_provision')

  const canManageBankTaxTransfer = () =>
    hasFeature('payment_condition_operator_fee')

  const canManageProducts = () => hasFeature('product_composition')

  const canManageProductionStages = () =>
    hasFeature('product_production_stages')

  const canManageClients = () => hasFeature('client_additional_tabs')

  const canManageSuppliers = () => hasFeature('supplier_additional_tabs')

  const canManageClientResponsible = () =>
    hasFeature('client_responsible_management')

  const canManageDeliverySchedule = () => hasFeature('delivery_production_tabs')

  const canShowQuotationItemDetails = () => hasFeature('pdf_show_item_details')

  const canCreatePaymentDifference = () => hasFeature('payment_difference')

  const canBillOnDeliveryAndCheckout = () =>
    hasFeature('can_bill_on_delivery_and_checkout')

  const canManageCancelTransactionReasons = () =>
    hasFeature('transaction_cancel_reasons')

  const hasFiscalModule = () => hasFeature('nota_fiscal')

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
    canCreateBankAccount,
    canDeleteBankAccount,
    canProvision,
    canManageBankTaxTransfer,
    canManageProducts,
    canManageProductionStages,
    canManageClients,
    canManageSuppliers,
    canManageClientResponsible,
    canManageDeliverySchedule,
    canManageMultipleCompanies,
    canShowQuotationItemDetails,
    canCreatePaymentDifference,
    canBillOnDeliveryAndCheckout,
    canManageCancelTransactionReasons,
    hasFiscalModule,
  }
}
