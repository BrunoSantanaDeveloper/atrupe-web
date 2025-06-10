import { Metadata } from 'next'

// Components
import { Quotation } from './components/Quotation'

// Types
import { ParamsType } from '@/types/coreTypes'

export const metadata: Metadata = {
  title: 'Orçamento',
  description: 'Orçamento',
}

export default async function QuotationPage({ params }: ParamsType) {
  return <Quotation id={params.quotationId} />
}
