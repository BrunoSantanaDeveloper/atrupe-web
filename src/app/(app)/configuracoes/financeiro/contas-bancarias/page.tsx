// Components
import { BankAccounts } from './components/BankAccounts'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Configurações de Contas Bancárias',
  }
}

export default function BankAccountsPage({ searchParams }: SearchParamsType) {
  return <BankAccounts searchParams={searchParams} />
}
