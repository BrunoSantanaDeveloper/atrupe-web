import { QuotationsData } from '@/app/(app-sidebar)/vendas/orcamentos/components/QuotationsTable/QuotationsData'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FeatureGate } from '@/components/common/FeatureGate'
import { UpgradeFallback } from '@/components/common/UpgradeFallback'
import { FEATURES } from '@/consts/features'

interface Props {
  params: {
    id: string
    tab: string
  }
}

export default function SupplierQuotationsPage({ params }: Props) {
  return (
    <FeatureGate
      features={[FEATURES.CONTACTS.SUPPLIER_ADDITIONAL_TABS]}
      fallback={
        <UpgradeFallback
          title="Abas adicionais de fornecedor"
          description="A aba de orçamentos no cadastro do fornecedor faz parte do plano Lite. Faça upgrade para acessá-la."
        />
      }
    >
      <PermissionGate
        permissions={['sale:quotation:view']}
        fallback={
          <div className="p-4">
            Você não tem permissão para visualizar os orçamentos do fornecedor.
          </div>
        }
      >
        <div className="rounded-lg my-6 bg-white overflow-hidden">
          <QuotationsData
            searchParams={{ supplierId: params.id }}
            searchDescription="Nenhum orçamento encontrado para esse fornecedor"
          />
        </div>
      </PermissionGate>
    </FeatureGate>
  )
}
