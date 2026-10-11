import { ManagerBoard } from './components/ManagerBoard'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

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
        wall={{
          title: 'Gerenciador de produção',
          description:
            'A fila de cada setor, com agenda, quem está trabalhando e o tempo medido.',
          pageTitle: true,
        }}
      >
        <ManagerBoard />
      </FeatureGate>
    </PermissionGate>
  )
}
