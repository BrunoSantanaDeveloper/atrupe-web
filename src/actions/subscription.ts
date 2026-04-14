'use server'

import { getData, getItem } from './_cruds'

/**
 * Busca a URL de pagamento pendente para a empresa do usuário logado
 */
export async function getPendingPaymentUrl(): Promise<{
  paymentUrl: string | null
  dueDate: string | null
}> {
  try {
    const response = await getData({
      route: '/subscriptions/my-pending-payment',
    })

    return {
      paymentUrl: response?.data?.paymentUrl || null,
      dueDate: response?.data?.dueDate || null,
    }
  } catch (error) {
    console.error('Error fetching pending payment URL:', error)
    return {
      paymentUrl: null,
      dueDate: null,
    }
  }
}

/**
 * Busca as features atuais do plano/subscription para sincronizar a sessão.
 * Resolve o problema de JWT desatualizado após contratação de módulos.
 */
export async function refreshPlanFeatures(): Promise<{
  success: boolean
  features: string[]
  limits: Record<string, number>
  planName: string | null
  active: boolean
}> {
  try {
    const response = await getItem({
      route: '/subscriptions/active',
    })

    if (!response?.success || !response?.data) {
      return {
        success: false,
        features: [],
        limits: {},
        planName: null,
        active: false,
      }
    }

    const subscription = response.data
    const plan = subscription.plan

    if (!plan) {
      return {
        success: false,
        features: [],
        limits: {},
        planName: null,
        active: false,
      }
    }

    // Features do plano base
    const planFeatureKeys: string[] =
      plan.planFeatures
        ?.filter(
          (pf: { isActive: boolean; feature: { key: string } }) =>
            pf.isActive && pf.feature,
        )
        .map((pf: { feature: { key: string } }) => pf.feature.key) || []

    // Features adicionais da subscription (ex: nota_fiscal)
    const subFeatureKeys: string[] =
      subscription.subscriptionFeatures
        ?.filter(
          (sf: { isActive: boolean; feature: { key: string } }) =>
            sf.isActive !== false && sf.feature,
        )
        .map((sf: { feature: { key: string } }) => sf.feature.key) || []

    const features = Array.from(
      new Set([...planFeatureKeys, ...subFeatureKeys]),
    )

    // Limits do plano
    const limits: Record<string, number> = {}
    plan.planLimits?.forEach(
      (pl: { limit?: { key: string }; value?: number }) => {
        if (pl.limit?.key) {
          limits[pl.limit.key] = pl.value || 0
        }
      },
    )

    return {
      success: true,
      features,
      limits,
      planName: plan.planType || null,
      active: subscription.status === 'ACTIVE',
    }
  } catch (error) {
    console.error('Error refreshing plan features:', error)
    return {
      success: false,
      features: [],
      limits: {},
      planName: null,
      active: false,
    }
  }
}
