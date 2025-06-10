import { QuotationsData } from '@/app/(app)/vendas/orcamentos/components/QuotationsTable/QuotationsData'

interface Props {
  params: {
    id: string
    tab: string
  }
}

export default function SupplierQuotationsPage({ params }: Props) {
  return (
    <div className="rounded-lg my-6 bg-white overflow-hidden">
      <QuotationsData
        searchParams={{ supplierId: params.id }}
        searchDescription="Nenhum orçamento encontrado para esse fornecedor"
      />
    </div>
  )
}
