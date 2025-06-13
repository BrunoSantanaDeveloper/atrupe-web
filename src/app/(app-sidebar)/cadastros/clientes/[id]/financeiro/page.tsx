import { redirect } from 'next/navigation'

interface Props {
  params: {
    id: string
    tab: string
  }
}

export default function ClientFinancialPage({ params }: Props) {
  redirect(`/financeiro/fluxo-financeiro?clientId=${params.id}`)
}
