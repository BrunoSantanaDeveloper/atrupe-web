import { QuotationsData } from '@/app/(app)/vendas/orcamentos/components/QuotationsTable/QuotationsData'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'

interface Props {
  params: {
    id: string
    tab: string
  }
}

export default function ClientQuotationsPage({ params }: Props) {
  return (
    <div className="rounded-lg my-6 bg-white overflow-hidden">
      <Suspense fallback={<Loader2 className="size-16 animate-spin p-8" />}>
        <QuotationsData
          searchParams={{ clientId: params.id }}
          searchDescription="Nenhum orçamento encontrado para esse cliente"
        />
      </Suspense>
    </div>
  )
}
