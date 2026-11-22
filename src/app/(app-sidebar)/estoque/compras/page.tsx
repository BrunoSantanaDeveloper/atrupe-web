import { Purchases } from './components/Purchases'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Compras' }
}

// As compras e os lotes do FULL (ES-8 a ES-17; 22/11/2026)
export default function Page() {
  return (
    <PermissionGate
      permissions={['stock:purchase:view']}
      fallback={
        <div className="p-4">Você não tem permissão para ver as compras.</div>
      }
    >
      <FeatureGate
        features={[FEATURES.STOCK.PURCHASING]}
        wall={{
          title: 'Compras',
          description:
            'Solicitação de material, cotação, pedido de compra com conferência e o estoque por lote.',
          pageTitle: true,
        }}
      >
        <Purchases />
      </FeatureGate>
    </PermissionGate>
  )
}
