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
    <PermissionGate permissions={['invoice_settings:nf:view']}>
      <FiscalSettingsClient />
    </PermissionGate>
  )
}
