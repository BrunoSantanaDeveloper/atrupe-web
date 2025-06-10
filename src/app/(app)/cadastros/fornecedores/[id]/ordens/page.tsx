import { OrdersData } from '@/app/(app)/vendas/ordens-de-servico/components/OrdersTable/OrdersData'

interface Props {
  params: {
    id: string
    tab: string
  }
}

export default function SupplierOrdersPage({ params }: Props) {
  return (
    <div className="rounded-lg my-6 bg-white overflow-hidden">
      <OrdersData
        searchParams={{ supplierId: params.id }}
        searchDescription="Nenhuma ordem de serviço encontrada para esse fornecedor"
      />
    </div>
  )
}
