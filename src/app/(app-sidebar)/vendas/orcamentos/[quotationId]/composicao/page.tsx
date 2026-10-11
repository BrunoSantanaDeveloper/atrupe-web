import { QuotationComposition } from './components/QuotationComposition'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// Consts
import { FEATURES } from '@/consts/features'
import { DEMO_DATA } from '@/lib/demo'

// Next
import { notFound } from 'next/navigation'

export function metadata() {
  return { title: 'Itens do orçamento' }
}

export default function QuotationCompositionPage({
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
      {/* No LITE a tela serve para acrescentar produtos e escolher a
          variação; montar o item por processos e partes é do PRO */}
      <FeatureGate
        features={[
          FEATURES.COSTS.COST_BASE,
          FEATURES.PRODUCTS.PRODUCT_COMPOSITION,
        ]}
        wall={{
          title: 'Composição no orçamento',
          description:
            'Montar o item por processos, partes e terceirizados. Sem o recurso, o item é vendido pelo preço do cadastro.',
          pageTitle: true,
        }}
      >
        <QuotationComposition quotationId={params.quotationId} />
      </FeatureGate>
    </PermissionGate>
  )
}
