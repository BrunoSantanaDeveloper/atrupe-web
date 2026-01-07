// Components
import { IssueInvoice } from './components/IssueInvoice'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export default function IssueInvoicePage({ searchParams }: SearchParamsType) {
  return <IssueInvoice searchParams={searchParams} />
}
