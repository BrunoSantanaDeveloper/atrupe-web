'use client'

import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import {
  UpgradeFallback,
  type UpgradeFallbackProps,
} from '@/components/common/UpgradeFallback'

interface Props {
  children: React.ReactNode
  features?: string[]
  requireAll?: boolean
  fallback?: React.ReactNode
  /**
   * Atalho para a parede de plano: o FeatureGate repassa as chaves, e a
   * parede diz o plano que as libera. Vale quando não há `fallback`.
   */
  wall?: Omit<UpgradeFallbackProps, 'feature' | 'requireAll'>
  showUpgradeMessage?: boolean
}

export function FeatureGate({
  children,
  features = [],
  requireAll = false,
  fallback = null,
  wall,
  showUpgradeMessage = false,
}: Props) {
  const { hasAnyFeature, hasAllFeatures } = usePlanFeatures()

  // Se não há features para verificar, mostrar o conteúdo
  if (!features.length) return <>{children}</>

  // Verificar features
  const hasFeature = requireAll
    ? hasAllFeatures(features)
    : hasAnyFeature(features)

  if (!hasFeature) {
    if (wall && !fallback) {
      return (
        <UpgradeFallback {...wall} feature={features} requireAll={requireAll} />
      )
    }

    return showUpgradeMessage ? (
      <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg border">
        <p>Esta funcionalidade não está incluída no seu plano atual.</p>
        <p>Faça upgrade do seu plano para acessar esta feature.</p>
      </div>
    ) : (
      <>{fallback}</>
    )
  }

  return <>{children}</>
}
