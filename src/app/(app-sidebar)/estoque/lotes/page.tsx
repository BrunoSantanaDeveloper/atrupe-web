import { Lots } from './components/Lots'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Lotes' }
}

// As compras e os lotes do FULL (ES-8 a ES-17; 22/11/2026)
export default function Page() {
  return (
    <PermissionGate
      permissions={['stock:lot:view']}
      fallback={
        <div className="p-4">Você não tem permissão para ver os lotes.</div>
      }
    >
      <FeatureGate
        features={[FEATURES.STOCK.PURCHASING]}
        wall={{
          title: 'Lotes',
          description:
            'Solicitação de material, cotação, pedido de compra com conferência e o estoque por lote.',
          pageTitle: true,
        }}
      >
        <Lots />
      </FeatureGate>
    </PermissionGate>
  )
}
