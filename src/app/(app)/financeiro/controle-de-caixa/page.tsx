// Components
import { CashControl } from './components/CashControl'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Controle de Caixa',
  }
}

export default function CashControlPage({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      permissions={['financial:cash_control:view']}
      fallback={<div>Você não tem permissão para acessar esta página.</div>}
    >
      <CashControl searchParams={searchParams} />
    </PermissionGate>
  )
}
