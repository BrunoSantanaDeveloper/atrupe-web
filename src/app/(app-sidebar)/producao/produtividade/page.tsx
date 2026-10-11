import { Productivity } from './components/Productivity'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Produtividade' }
}

export default function ProductivityPage() {
  return (
    <PermissionGate
      permissions={['production:production:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar a produtividade.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.PRODUCTION.PRODUCTIVITY_TRACKING]}
        wall={{
          title: 'Produtividade',
          description:
            'Compara o tempo previsto pela composição com o tempo realizado na produção.',
          pageTitle: true,
        }}
      >
        <Productivity />
      </FeatureGate>
    </PermissionGate>
  )
}
