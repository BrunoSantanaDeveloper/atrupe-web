// Produção › Setores (LITE; área 9 §4.16, 26/11/2026)
import { SectorsHome } from './components/SectorsHome'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Setores' }
}

export default function SectorsPage() {
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
          title: 'Setores',
          description:
            'A lista de trabalhos de cada setor, para concluir o que é dele.',
          pageTitle: true,
        }}
      >
        <SectorsHome />
      </FeatureGate>
    </PermissionGate>
  )
}
