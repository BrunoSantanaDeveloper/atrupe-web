// Component Imports
import { PDV } from '@/app/(app-sidebar)/financeiro/frente-de-caixa/components/PDV'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FeatureGate } from '@/components/common/FeatureGate'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Frente de Caixa',
  }
}

export default function PDVPage({ searchParams }: SearchParamsType) {
  return (
    <FeatureGate features={['pdv']} showUpgradeMessage>
      <PermissionGate
        permissions={['financial:checkout:view']}
        fallback={
          <div className="p-4">
            Você não tem permissão para visualizar a frente de caixa.
          </div>
        }
      >
        <PDV searchParams={searchParams} />
      </PermissionGate>
    </FeatureGate>
  )
}
