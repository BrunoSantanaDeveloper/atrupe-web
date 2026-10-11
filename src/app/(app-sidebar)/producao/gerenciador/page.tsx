import { ManagerBoard } from './components/ManagerBoard'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'
import { UpgradeFallback } from '@/components/common/UpgradeFallback'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Gerenciador de produção' }
}

export default function ProductionBoardPage() {
  return (
    <PermissionGate
      permissions={['production:production:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar a produção.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.PRODUCTION.PRODUCTION_MANAGER]}
        fallback={
          <UpgradeFallback
            title="Gerenciador de produção"
            description="O gerenciador de produção faz parte do plano ELITE: a fila de cada setor, com agenda, quem está trabalhando e o tempo medido."
          />
        }
      >
        <ManagerBoard />
      </FeatureGate>
    </PermissionGate>
  )
}
