import { SearchParamsType } from '@/types/coreTypes'
import { CashFlowReport } from './components/CashFlowReport'

export default function Page({ searchParams }: SearchParamsType) {
  return <CashFlowReport searchParams={searchParams} />
}
