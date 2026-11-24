import { Vehicles } from './components/Vehicles'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Veículos' }
}

// Veículos, fase 1 (Maicol, 23/11/2026, ELITE)
export default function VehiclesPage() {
  return (
    <PermissionGate
      permissions={[
        'production:production:view',
        'production:vehicle_schedule:edit',
      ]}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar os veículos.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.PRODUCTION.PRODUCTION_MANAGER]}
        wall={{
          title: 'Veículos',
          description:
            'As saídas dos veículos com as paradas, o km de cada trabalho e quem estava com o veículo.',
          pageTitle: true,
        }}
      >
        <Vehicles />
      </FeatureGate>
    </PermissionGate>
  )
}
