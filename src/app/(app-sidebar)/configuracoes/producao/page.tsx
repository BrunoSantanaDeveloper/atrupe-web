import { ProductionSettings } from './components/ProductionSettings'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Configurações da produção' }
}

export default function ProductionSettingsPage() {
  return (
    <PermissionGate
      permissions={['production:production:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para configurar a produção.
        </div>
      }
    >
      <FeatureGate
        features={[
          FEATURES.PRODUCTION.PRODUCTION_MANAGER,
          FEATURES.PRODUCTION.SECTOR_BOARD,
        ]}
        wall={{
          title: 'Configurações da produção',
          description: 'Os gerenciadores e os tipos de tarefa da produção.',
          pageTitle: true,
        }}
      >
        <ProductionSettings />
      </FeatureGate>
    </PermissionGate>
  )
}
