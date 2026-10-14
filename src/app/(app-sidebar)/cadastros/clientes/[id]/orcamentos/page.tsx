import { QuotationsData } from '@/app/(app-sidebar)/vendas/orcamentos/components/QuotationsTable/QuotationsData'
import { Suspense } from 'react'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FeatureGate } from '@/components/common/FeatureGate'
import { FEATURES } from '@/consts/features'
import { IconLoader2 } from '@tabler/icons-react'

interface Props {
  params: {
    id: string
    tab: string
  }
}

export default function ClientQuotationsPage({ params }: Props) {
  return (
    <PermissionGate
      permissions={['sale:quotation:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar orçamentos.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.CONTACTS.CLIENT_ADDITIONAL_TABS]}
        wall={{
          title: 'Abas adicionais de cliente',
          description:
            'A aba Orçamentos reúne no cadastro os orçamentos do cliente.',
        }}
      >
        <div className="rounded-lg my-6 bg-white overflow-hidden">
          <Suspense
            fallback={<IconLoader2 className="size-16 animate-spin p-8" />}
          >
            <QuotationsData
              searchParams={{ clientId: params.id }}
              searchDescription="Nenhum orçamento encontrado para esse cliente"
            />
          </Suspense>
        </div>
      </FeatureGate>
    </PermissionGate>
  )
}
