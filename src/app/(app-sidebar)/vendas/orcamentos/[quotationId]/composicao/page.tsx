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
      {/* No LITE a tela serve para acrescentar produtos e escolher a
          variação; montar o item por processos e partes é do PRO */}
      <FeatureGate
        features={[
          FEATURES.COSTS.COST_BASE,
          FEATURES.PRODUCTS.PRODUCT_COMPOSITION,
        ]}
        fallback={
          <UpgradeFallback
            title="Composição no orçamento"
            description="Montar o item por processos, partes e terceirizados faz parte do plano PRO. No START o item é vendido pelo preço do cadastro."
          />
        }
      >
        <QuotationComposition quotationId={params.quotationId} />
      </FeatureGate>
    </PermissionGate>
  )
}
