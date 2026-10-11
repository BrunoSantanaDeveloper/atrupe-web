import { CompositionDetail } from './components/CompositionDetail'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// Consts
import { FEATURES } from '@/consts/features'
import { DEMO_DATA } from '@/lib/demo'

// Next
import { notFound } from 'next/navigation'

export function metadata() {
  return { title: 'Composição do produto' }
}

export default function CompositionPage({
  params,
}: {
  params: { id: string }
}) {
  // Tela de demonstração: sem a flag, "não encontrada" também aqui, e não
  // só no middleware, que não vê URL com ponto no segmento (MOCK-8)
  if (!DEMO_DATA) notFound()

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
