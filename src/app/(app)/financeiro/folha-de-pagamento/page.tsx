// Component Imports
import { Payroll } from './components/Payroll'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Folha de Pagamento',
  }
}

export default function PayrollPage({ searchParams }: SearchParamsType) {
  return <Payroll searchParams={searchParams} />
}
