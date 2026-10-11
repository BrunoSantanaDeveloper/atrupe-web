import { AssetDetail } from './components/AssetDetail'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// Consts
import { FEATURES } from '@/consts/features'
import { DEMO_DATA } from '@/lib/demo'

// Next
import { notFound } from 'next/navigation'

export function metadata() {
  return { title: 'Patrimônio' }
}

export default function AssetPage({ params }: { params: { id: string } }) {
  // Tela de demonstração: sem a flag, "não encontrada" também aqui, e não
  // só no middleware, que não vê URL com ponto no segmento (MOCK-8)
  if (!DEMO_DATA) notFound()

  return (
    <PermissionGate
      requireAll
      permissions={['cost:base:view', 'values:values:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar os patrimônios.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.COSTS.COST_BASE]}
        wall={{ title: 'Patrimônios', pageTitle: true }}
      >
        <AssetDetail id={params.id} />
      </FeatureGate>
    </PermissionGate>
  )
}
