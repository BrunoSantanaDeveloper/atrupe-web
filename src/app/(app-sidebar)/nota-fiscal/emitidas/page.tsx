import { IssuedInvoicesClient } from './components/IssuedInvoicesClient'
import { PermissionGate } from '@/components/common/PermissionGate'

export default function IssuedInvoicePage() {
  return (
    <PermissionGate
      permissions={['nota_fiscal:emitidas:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar notas emitidas.
        </div>
      }
    >
      <IssuedInvoicesClient />
    </PermissionGate>
  )
}
