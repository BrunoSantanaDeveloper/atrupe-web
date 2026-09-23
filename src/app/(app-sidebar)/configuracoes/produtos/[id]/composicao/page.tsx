import { CompositionDetail } from './components/CompositionDetail'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'
import { UpgradeFallback } from '@/components/common/UpgradeFallback'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Composição do produto' }
}

export default function CompositionPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <PermissionGate
      permissions={['product_settings:products:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar as composições.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.COSTS.COST_BASE]}
        fallback={<UpgradeFallback title="Composições" />}
      >
        <CompositionDetail id={params.id} />
      </FeatureGate>
    </PermissionGate>
  )
}
