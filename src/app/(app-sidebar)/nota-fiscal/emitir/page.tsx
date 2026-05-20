// Components
import { IssueInvoice } from './components/IssueInvoice'
import { PermissionGate } from '@/components/common/PermissionGate'
import { GestaoNotasClient } from '@/app/(app-sidebar)/configuracoes/nota-fiscal/gestao/components/GestaoNotasClient'
import { EmitirTabsWrapper } from './components/EmitirTabsWrapper'

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
      <div className="flex flex-col h-full space-y-4">
        <EmitirTabsWrapper
          emitirContent={<IssueInvoice searchParams={searchParams} />}
          gestaoContent={
            <PermissionGate permissions={['invoice:nfse:view']}>
              <GestaoNotasClient />
            </PermissionGate>
          }
        />
      </div>
    </PermissionGate>
  )
}
