import { OrdersData } from '@/app/(app-sidebar)/vendas/ordens-de-servico/components/OrdersTable/OrdersData'
import { Suspense } from 'react'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FeatureGate } from '@/components/common/FeatureGate'
import { FEATURES } from '@/consts/features'
import { CardContent } from '@/components/ui/card'
import { TableSkeleton } from '@/components/common/TableSkeleton'

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
          Você não tem permissão para visualizar ordens de serviço.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.CONTACTS.CLIENT_ADDITIONAL_TABS]}
        wall={{
          title: 'Abas adicionais de cliente',
          description:
            'A aba Ordens de serviço reúne no cadastro as ordens de serviço do cliente.',
        }}
      >
        <div className="rounded-lg my-6 bg-white overflow-hidden">
          <Suspense
            fallback={
              <CardContent>
                <TableSkeleton cols={5} />
              </CardContent>
            }
          >
            <OrdersData
              searchParams={{ clientId: params.id }}
              searchDescription="Nenhuma ordem de serviço encontrada para esse cliente"
            />
          </Suspense>
        </div>
      </FeatureGate>
    </PermissionGate>
  )
}
