import { QuotationsData } from '@/app/(app-sidebar)/vendas/orcamentos/components/QuotationsTable/QuotationsData'
import { PermissionGate } from '@/components/common/PermissionGate'

interface Props {
  params: {
    id: string
    tab: string
  }
}

export default function SupplierQuotationsPage({ params }: Props) {
  return (
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
  )
}
