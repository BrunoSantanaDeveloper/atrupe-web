import { Metadata } from 'next'
import { Suspense } from 'react'

// Components
import { Quotation } from './components/Quotation'

// Types
import { ParamsType } from '@/types/coreTypes'

export const metadata: Metadata = {
  title: 'Orçamento',
  description: 'Orçamento',
}

export default async function QuotationPage({ params }: ParamsType) {
  return (
    <Suspense fallback={null}>
      <Quotation id={params.quotationId} />
    </Suspense>
  )
}
