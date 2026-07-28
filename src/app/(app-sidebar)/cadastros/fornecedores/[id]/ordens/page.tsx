import { OrdersData } from '@/app/(app-sidebar)/vendas/ordens-de-servico/components/OrdersTable/OrdersData'
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

export default function SupplierOrdersPage({ params }: Props) {
  return (
    <FeatureGate
      features={[FEATURES.CONTACTS.SUPPLIER_ADDITIONAL_TABS]}
      fallback={
        <UpgradeFallback
          title="Abas adicionais de fornecedor"
          description="A aba de ordens de serviço no cadastro do fornecedor faz parte do plano Lite. Faça upgrade para acessá-la."
        />
      }
    >
      <PermissionGate
        permissions={['sale:order:view']}
        fallback={
          <div className="p-4">
            Você não tem permissão para visualizar as ordens de serviço do
            fornecedor.
          </div>
        }
      >
        <div className="rounded-lg my-6 bg-white overflow-hidden">
          <OrdersData
            searchParams={{ supplierId: params.id }}
            searchDescription="Nenhuma ordem de serviço encontrada para esse fornecedor"
          />
        </div>
      </PermissionGate>
    </FeatureGate>
  )
}
