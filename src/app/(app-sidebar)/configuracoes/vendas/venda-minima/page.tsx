import { MinSaleSettingsForm } from './components/MinSaleSettingsForm'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Venda mínima por item' }
}

export default function MinSaleSettingsPage() {
  return (
    <PermissionGate
      permissions={['sales_settings:series:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para configurar a venda mínima.
        </div>
      }
    >
      {/* A venda mínima por item é do LITE em diante (GR-4, 27/10/2026),
          junto da quantidade mínima do produto */}
      <FeatureGate
        features={[FEATURES.PRODUCTS.PRODUCT_COMPOSITION]}
        wall={{
          title: 'Venda mínima por item',
          description: 'O menor valor que um item do orçamento pode ter.',
          pageTitle: true,
        }}
      >
        <MinSaleSettingsForm />
      </FeatureGate>
    </PermissionGate>
  )
}
