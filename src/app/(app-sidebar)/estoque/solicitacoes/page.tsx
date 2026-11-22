import { Requests } from './components/Requests'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Solicitações de material' }
}

// As compras e os lotes do FULL (ES-8 a ES-17; 22/11/2026)
export default function Page() {
  return (
    <PermissionGate
      permissions={['stock:purchase_request:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para ver as solicitações de material.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.STOCK.PURCHASING]}
        wall={{
          title: 'Solicitações de material',
          description:
            'Solicitação de material, cotação, pedido de compra com conferência e o estoque por lote.',
          pageTitle: true,
        }}
      >
        <Requests />
      </FeatureGate>
    </PermissionGate>
  )
}
