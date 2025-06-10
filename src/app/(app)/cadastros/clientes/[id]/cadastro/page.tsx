'use client'

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { ClientSummary } from './components/Summary'
import { useClientById } from '@/hooks/queries/useClient'

interface Props {
  params: {
    id: string
    tab: string
  }
}

export default function ClientDataPage({ params }: Props) {
  const { data } = useClientById({ id: params.id })
  return (
    <Suspense fallback={<Loader2 className="size-16 animate-spin p-8" />}>
      <ClientSummary data={data} />
    </Suspense>
  )
}
