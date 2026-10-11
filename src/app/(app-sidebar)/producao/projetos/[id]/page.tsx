import { ProjectDetail } from './components/ProjectDetail'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// Consts
import { FEATURES } from '@/consts/features'
import { DEMO_DATA } from '@/lib/demo'

// Next
import { notFound } from 'next/navigation'

export function metadata() {
  return { title: 'Projeto' }
}

export default function Page({ params }: { params: { id: string } }) {
  // Tela de demonstração: sem a flag, "não encontrada" também aqui, e não
  // só no middleware, que não vê URL com ponto no segmento (MOCK-8)
  if (!DEMO_DATA) notFound()

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
        wall={{ title: 'Projeto', pageTitle: true }}
      >
        <ProjectDetail id={params.id} />
      </FeatureGate>
    </PermissionGate>
  )
}
