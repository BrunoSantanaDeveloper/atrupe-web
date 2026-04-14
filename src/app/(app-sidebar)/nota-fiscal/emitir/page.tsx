// Components
import { IssueInvoice } from './components/IssueInvoice'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export default function IssueInvoicePage({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      permissions={['nota_fiscal:emitir:create']}
      fallback={
        <div className="p-4">
          Você não tem permissão para emitir nota fiscal.
        </div>
      }
    >
      <IssueInvoice searchParams={searchParams} />
    </PermissionGate>
  )
}
