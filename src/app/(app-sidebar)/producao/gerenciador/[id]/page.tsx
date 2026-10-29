import { SectorScreen } from '../components/SectorScreen'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// Consts
import { FEATURES } from '@/consts/features'
import { DEMO_DATA } from '@/lib/demo'

// Next
import { notFound } from 'next/navigation'

export function metadata() {
  return { title: 'Gerenciador do setor' }
}

// A tela de um setor (GP-45): o quadro no coletivo, a fila do dia no
// individual, a mesma guarda de permissão e plano da entrada
export default function Page({ params }: { params: { id: string } }) {
  // Tela de demonstração: sem a flag, "não encontrada" também aqui (MOCK-8)
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
        wall={{
          title: 'Gerenciador de produção',
          description:
            'A fila de cada setor, com agenda, quem está trabalhando e o tempo medido.',
          pageTitle: true,
        }}
      >
        <SectorScreen id={params.id} />
      </FeatureGate>
    </PermissionGate>
  )
}
