import { QuotationsData } from '@/app/(app-sidebar)/vendas/orcamentos/components/QuotationsTable/QuotationsData'
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
            fallback={
              <CardContent>
                <TableSkeleton cols={6} />
              </CardContent>
            }
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
