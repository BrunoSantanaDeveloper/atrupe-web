import { OrdersData } from '@/app/(app-sidebar)/vendas/ordens-de-servico/components/OrdersTable/OrdersData'
import { PermissionGate } from '@/components/common/PermissionGate'

interface Props {
  params: {
    id: string
    tab: string
  }
}

export default function SupplierOrdersPage({ params }: Props) {
  return (
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
  )
}
