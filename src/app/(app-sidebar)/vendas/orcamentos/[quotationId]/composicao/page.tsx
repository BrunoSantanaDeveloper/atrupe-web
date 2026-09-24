import { QuotationComposition } from './components/QuotationComposition'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'
import { UpgradeFallback } from '@/components/common/UpgradeFallback'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Itens do orçamento' }
}

export default function QuotationCompositionPage({
  params,
}: {
  params: { quotationId: string }
}) {
  return (
    <PermissionGate
      permissions={['sale:quotation:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar o orçamento.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.COSTS.COST_BASE]}
        fallback={
          <UpgradeFallback
            title="Composição no orçamento"
            description="Montar o item por processos, partes e terceirizados faz parte do plano PRO. No START e no LITE o item é vendido pelo preço do cadastro."
          />
        }
      >
        <QuotationComposition quotationId={params.quotationId} />
      </FeatureGate>
    </PermissionGate>
  )
}
