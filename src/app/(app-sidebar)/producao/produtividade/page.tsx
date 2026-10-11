import { Productivity } from './components/Productivity'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'
import { UpgradeFallback } from '@/components/common/UpgradeFallback'

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
        fallback={
          <UpgradeFallback
            title="Produtividade"
            description="A medição de produtividade faz parte do plano ELITE: compara o tempo previsto pela composição com o tempo realizado na produção."
          />
        }
      >
        <Productivity />
      </FeatureGate>
    </PermissionGate>
  )
}
