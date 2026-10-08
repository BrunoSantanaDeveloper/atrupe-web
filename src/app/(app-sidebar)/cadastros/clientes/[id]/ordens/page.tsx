import { OrdersData } from '@/app/(app-sidebar)/vendas/ordens-de-servico/components/OrdersTable/OrdersData'
import { Suspense } from 'react'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FeatureGate } from '@/components/common/FeatureGate'
import { UpgradeFallback } from '@/components/common/UpgradeFallback'
import { FEATURES } from '@/consts/features'
import { IconLoader2 } from '@tabler/icons-react'

interface Props {
  params: {
    id: string
    tab: string
  }
}

export default function ClientOrdersPage({ params }: Props) {
  return (
    <FeatureGate
      features={[FEATURES.CONTACTS.CLIENT_ADDITIONAL_TABS]}
      fallback={
        <UpgradeFallback
          title="Abas adicionais de cliente"
          description="A aba de ordens de serviço no cadastro do cliente faz parte do plano Lite. Faça upgrade para acessá-la."
        />
      }
    >
      <PermissionGate
        permissions={['sale:order:view']}
        fallback={
          <div className="p-4">
            Você não tem permissão para visualizar ordens de serviço.
          </div>
        }
      >
        <div className="rounded-lg my-6 bg-white overflow-hidden">
          <Suspense
            fallback={
              <IconLoader2 aria-hidden className="size-16 animate-spin p-8" />
            }
          >
            <OrdersData
              searchParams={{ clientId: params.id }}
              searchDescription="Nenhuma ordem de serviço encontrada para esse cliente"
            />
          </Suspense>
        </div>
      </PermissionGate>
    </FeatureGate>
  )
}
