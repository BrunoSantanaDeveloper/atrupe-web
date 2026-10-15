'use client'

import { useSession } from 'next-auth/react'
import { useCallback } from 'react'

export function usePlanFeatures() {
  const { data: session } = useSession()

  const features = session?.company?.plan?.features

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

  const canCreateQuickSale = () => hasFeature('quotation_quick_sale')

  const canManageRejectionReasons = () =>
    hasFeature('quotation_rejection_reasons')

  // Motivo ao cancelar ordem de serviço: chave própria, a mesma que o
  // servidor exige quando o cancelamento leva um motivo.
  const canRequestOrderCancellationReason = () =>
    hasFeature('service_order_cancellation_reason')

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

  // Faturar na frente de caixa pede também a frente de caixa (LITE)
  const canBillOnCheckout = () =>
    canBillOnDeliveryAndCheckout() && hasFeature('pdv_screen')

  const canManageCancelTransactionReasons = () =>
    hasFeature('transaction_cancel_reasons')

  const hasFiscalModule = () => hasFeature('nota_fiscal')

  return {
    planName,
    hasFeature,
    hasAnyFeature,
    hasAllFeatures,
    canManageSectors,
    canCreateQuickSale,
    canManageRejectionReasons,
    canRequestOrderCancellationReason,
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
    canBillOnCheckout,
    canManageCancelTransactionReasons,
    hasFiscalModule,
  }
}
