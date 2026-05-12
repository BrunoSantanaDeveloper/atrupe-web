import { Main } from './components/Main'
import type { SearchParamsType } from '@/types/coreTypes'

export default function AccessHistoryPage({ searchParams }: SearchParamsType) {
  return <Main searchParams={searchParams} />
}
