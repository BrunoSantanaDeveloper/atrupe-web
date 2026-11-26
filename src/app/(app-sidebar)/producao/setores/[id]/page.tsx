// A tela de um setor no LITE (área 9 §4.16, 26/11/2026)
import { SectorWork } from '../components/SectorWork'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Setor' }
}

export default function SectorPage({ params }: { params: { id: string } }) {
  return (
    <PermissionGate
      permissions={['production:delivery_schedule:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar a produção.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.PRODUCTS.DELIVERY_PRODUCTION_STAGES]}
        wall={{
          title: 'Setor',
          description:
            'A lista de trabalhos de cada setor, para concluir o que é dele.',
          pageTitle: true,
        }}
      >
        <SectorWork sectorId={params.id} />
      </FeatureGate>
    </PermissionGate>
  )
}
