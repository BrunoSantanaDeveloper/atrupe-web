import { redirect } from 'next/navigation'

interface Props {
  params: {
    id: string
    tab: string
  }
}

export default function SupplierFinancialPage({ params }: Props) {
  redirect(`/financeiro/fluxo-financeiro?supplierId=${params.id}`)
}
