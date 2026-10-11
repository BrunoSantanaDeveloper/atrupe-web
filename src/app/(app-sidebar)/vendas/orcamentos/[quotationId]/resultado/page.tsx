import { QuotationResult } from './components/QuotationResult'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// Consts
import { FEATURES } from '@/consts/features'
import { DEMO_DATA } from '@/lib/demo'

// Next
import { notFound } from 'next/navigation'

export function metadata() {
  return { title: 'Resultado previsto do orçamento' }
}

// Tela de método: mostra custo, margem e a formação do preço. Por isso exige
// permissão própria, além de ver valores, e não vem liberada nos perfis
// operacionais (ORC-8 e seguranca.md SEG-6).
export default function QuotationResultPage({
  params,
}: {
  params: { quotationId: string }
}) {
  // Tela de demonstração: sem a flag, "não encontrada" também aqui, e não
  // só no middleware, que não vê URL com ponto no segmento (MOCK-8)
  if (!DEMO_DATA) notFound()

  return (
    <PermissionGate
      requireAll
      permissions={['cost:pricing:view', 'values:values:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar o resultado desta venda.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.COSTS.COST_BASE]}
        wall={{
          title: 'Resultado previsto da venda',
          description: 'O custo, a margem e o resultado de cada venda.',
          pageTitle: true,
        }}
      >
        <QuotationResult quotationId={params.quotationId} />
      </FeatureGate>
    </PermissionGate>
  )
}
