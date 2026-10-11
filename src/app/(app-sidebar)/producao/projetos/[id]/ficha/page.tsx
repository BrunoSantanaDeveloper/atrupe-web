import { ProductionSheet } from './components/ProductionSheet'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'
import { UpgradeFallback } from '@/components/common/UpgradeFallback'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Ficha de produção' }
}

export default function Page({ params }: { params: { id: string } }) {
  return (
    <PermissionGate
      permissions={['production:production:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar a produção.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.PRODUCTION.PRODUCTION_MANAGER]}
        fallback={<UpgradeFallback title="Ficha de produção" />}
      >
        <ProductionSheet id={params.id} />
      </FeatureGate>
    </PermissionGate>
  )
}
