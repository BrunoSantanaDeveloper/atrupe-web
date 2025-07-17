// Components
import { Quotations } from './components/Quotations'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Orçamentos',
  }
}

export default function QuotationsPage({ searchParams }: SearchParamsType) {
  const defaultTab = 'digitacao'
  const status = searchParams.status || defaultTab

  return (
    <PermissionGate
      permissions={['sale:quotation:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar a página de orçamentos.
        </div>
      }
    >
      <Quotations searchParams={{ ...searchParams, status }} />
    </PermissionGate>
  )
}
