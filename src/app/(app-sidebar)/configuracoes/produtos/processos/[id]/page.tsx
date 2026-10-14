import { ProcessEditor } from './components/ProcessEditor'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// Consts
import { FEATURES } from '@/consts/features'
import { DEMO_DATA } from '@/lib/demo'

// Next
import { notFound } from 'next/navigation'

export function metadata() {
  return { title: 'Processo' }
}

export default function ProcessPage({ params }: { params: { id: string } }) {
  // Tela de demonstração: sem a flag, "não encontrada" também aqui, e não
  // só no middleware, que não vê URL com ponto no segmento (MOCK-8)
  if (!DEMO_DATA) notFound()

  return (
    <PermissionGate
      permissions={['product_settings:composition:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar os processos.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.COSTS.COST_BASE]}
        wall={{ title: 'Processos', pageTitle: true }}
      >
        <ProcessEditor id={params.id} />
      </FeatureGate>
    </PermissionGate>
  )
}
