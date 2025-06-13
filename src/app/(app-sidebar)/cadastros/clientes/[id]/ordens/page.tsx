import { OrdersData } from '@/app/(app-sidebar)/vendas/ordens-de-servico/components/OrdersTable/OrdersData'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'
import { PermissionGate } from '@/components/common/PermissionGate'

interface Props {
  params: {
    id: string
    tab: string
  }
}

export default function ClientOrdersPage({ params }: Props) {
  return (
    <PermissionGate
      permissions={['sale:order:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar as ordens de serviço do
          cliente.
        </div>
      }
    >
      <div className="rounded-lg my-6 bg-white overflow-hidden">
        <Suspense fallback={<Loader2 className="size-16 animate-spin p-8" />}>
          <OrdersData
            searchParams={{ clientId: params.id }}
            searchDescription="Nenhuma ordem de serviço encontrada para esse cliente"
          />
        </Suspense>
      </div>
    </PermissionGate>
  )
}
