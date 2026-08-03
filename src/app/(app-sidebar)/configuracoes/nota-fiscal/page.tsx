// Components
import { PermissionGate } from '@/components/common/PermissionGate'
import { FiscalSettingsClient } from './FiscalSettingsClient'

export function metadata() {
  return {
    title: 'Configurações de Nota Fiscal',
  }
}

export default function InvoicePage() {
  return (
    <PermissionGate
      permissions={['nota_fiscal:config:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar as configurações de nota
          fiscal.
        </div>
      }
    >
      <FiscalSettingsClient />
    </PermissionGate>
  )
}
