// Components
import { ProposalPrint } from '../components/ProposalPrint'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// Consts
import { FEATURES } from '@/consts/features'
import { DEMO_DATA } from '@/lib/demo'

// Next
import { notFound } from 'next/navigation'

export function metadata() {
  return { title: 'Proposta' }
}

export default function ProposalPage({
  params,
}: {
  params: { quotationId: string }
}) {
  // Tela de demonstração: sem a flag, "não encontrada" também aqui, e não
  // só no middleware, que não vê URL com ponto no segmento (MOCK-8)
  if (!DEMO_DATA) notFound()

  return (
    <PermissionGate
      permissions={['sale:quotation:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar o orçamento.
        </div>
      }
    >
      {/* A proposta da composição tem a mesma parede da tela de composição:
          sem uma das duas chaves, a URL direta também mostra a parede */}
      <FeatureGate
        features={[
          FEATURES.COSTS.COST_BASE,
          FEATURES.PRODUCTS.PRODUCT_COMPOSITION,
        ]}
        wall={{
          title: 'Proposta da composição',
          description:
            'A proposta com o item montado por processos, partes e terceirizados.',
          pageTitle: true,
        }}
      >
        <ProposalPrint quotationId={params.quotationId} />
      </FeatureGate>
    </PermissionGate>
  )
}
