import { Topbar } from '@/components/common/Topbar'
import { UnderConstruction } from '@/components/UnderConstruction'
import { PermissionGate } from '@/components/common/PermissionGate'

export function metadata() {
  return {
    title: 'Configurações de Nota Fiscal',
  }
}

export default function InvoicePage() {
  return (
    <PermissionGate
      permissions={['invoice:nfse:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar as configurações de nota
          fiscal.
        </div>
      }
    >
      <div>
        <Topbar title="Nota fiscal" />
        <UnderConstruction />
      </div>
    </PermissionGate>
  )
}
