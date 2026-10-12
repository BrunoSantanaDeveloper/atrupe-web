import { CompositionDetail } from './components/CompositionDetail'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

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
      {/* No LITE a tela abre só com as variações; no PRO, com a composição
          inteira (ORC-6) */}
      <FeatureGate
        features={[
          FEATURES.COSTS.COST_BASE,
          FEATURES.PRODUCTS.PRODUCT_COMPOSITION,
        ]}
        wall={{ title: 'Composições', pageTitle: true }}
      >
        <CompositionDetail id={params.id} />
      </FeatureGate>
    </PermissionGate>
  )
}
